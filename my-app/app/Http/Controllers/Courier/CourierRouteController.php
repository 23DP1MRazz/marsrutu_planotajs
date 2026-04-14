<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courier\UpdateRouteStopStatusRequest;
use App\Http\Requests\Courier\UploadProofOfDeliveryRequest;
use App\Models\DeliveryRoute;
use App\Models\ProofOfDelivery;
use App\Models\RouteStop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourierRouteController extends Controller
{
    public function showPage(Request $request): Response
    {
        $this->authorizeCourierAccess($request);

        $deliveryRoute = $this->todayRouteForUser($request);

        return Inertia::render('courier/route', [
            'deliveryRoute' => $deliveryRoute ? $this->formatRoute($deliveryRoute) : null,
            'stops' => $deliveryRoute ? $this->formatStops($deliveryRoute) : [],
        ]);
    }

    public function showToday(Request $request): JsonResponse
    {
        $this->authorizeCourierAccess($request);
        $deliveryRoute = $this->todayRouteForUser($request);

        if ($deliveryRoute === null) {
            return response()->json([
                'deliveryRoute' => null,
                'stops' => [],
            ]);
        }

        return response()->json([
            'deliveryRoute' => $this->formatRoute($deliveryRoute),
            'stops' => $this->formatStops($deliveryRoute),
        ]);
    }

    public function updateStopStatus(
        UpdateRouteStopStatusRequest $request,
        RouteStop $routeStop,
    ): RedirectResponse {
        $this->authorizeCourierAccess($request);
        $routeStop->loadMissing(['route', 'order']);
        abort_unless(
            $routeStop->route !== null
            && (int) $routeStop->route->courier_user_id === (int) $request->user()->id
            && $routeStop->route->date === Carbon::today()->toDateString(),
            403,
        );

        $data = $request->validated();

        DB::transaction(function () use ($routeStop, $data): void {
            $this->applyStopStatus($routeStop, $data['status'], $data['fail_reason'] ?? null);
            $this->refreshRouteStatus($routeStop->route);
        });

        return to_route('courier.route.page');
    }

    public function uploadProof(
        UploadProofOfDeliveryRequest $request,
        RouteStop $routeStop,
    ): RedirectResponse {
        $this->authorizeCourierAccess($request);
        $routeStop->loadMissing(['route', 'proofOfDelivery']);
        abort_unless(
            $routeStop->route !== null
            && (int) $routeStop->route->courier_user_id === (int) $request->user()->id
            && $routeStop->route->date === Carbon::today()->toDateString(),
            403,
        );

        $file = $request->file('file');
        $path = $file->store('proof-of-delivery', 'public');

        ProofOfDelivery::query()->create([
            'organization_id' => $routeStop->organization_id,
            'route_stop_id' => $routeStop->id,
            'type' => 'PHOTO',
            'file_url' => Storage::disk('public')->url($path),
            'taken_at' => Carbon::now(),
        ]);

        return to_route('courier.route.page');
    }

    private function todayRouteForUser(Request $request): ?DeliveryRoute
    {
        return DeliveryRoute::query()
            ->with([
                'routeStops' => fn ($query) => $query->orderBy('seq_no'),
                'routeStops.proofOfDelivery',
                'routeStops.order.client:id,name',
                'routeStops.order.address:id,city,street',
            ])
            ->where('organization_id', $request->user()->organization_id)
            ->where('courier_user_id', $request->user()->id)
            ->whereDate('date', Carbon::today()->toDateString())
            ->first();
    }

    /**
     * @return array{id: int, organization_id: int, courier_user_id: int, date: string, status: string}
     */
    private function formatRoute(DeliveryRoute $deliveryRoute): array
    {
        return [
            'id' => $deliveryRoute->id,
            'organization_id' => $deliveryRoute->organization_id,
            'courier_user_id' => $deliveryRoute->courier_user_id,
            'date' => $deliveryRoute->date,
            'status' => $deliveryRoute->status,
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, seq_no: int, order_id: int, planned_eta: mixed, arrived_at: mixed, completed_at: mixed, status: string, fail_reason: string|null, proof_file_url: string|null, client_name: string|null, address_label: string}>
     */
    private function formatStops(DeliveryRoute $deliveryRoute)
    {
        return $deliveryRoute->routeStops->map(fn (RouteStop $routeStop) => [
            'id' => $routeStop->id,
            'seq_no' => $routeStop->seq_no,
            'order_id' => $routeStop->order_id,
            'planned_eta' => $routeStop->planned_eta,
            'arrived_at' => $routeStop->arrived_at,
            'completed_at' => $routeStop->completed_at,
            'status' => $routeStop->status,
            'fail_reason' => $routeStop->fail_reason,
            'proof_file_url' => $routeStop->proofOfDelivery?->file_url,
            'client_name' => $routeStop->order?->client?->name,
            'address_label' => collect([
                $routeStop->order?->address?->city,
                $routeStop->order?->address?->street,
            ])->filter()->join(', '),
        ]);
    }

    private function applyStopStatus(
        RouteStop $routeStop,
        string $status,
        ?string $failReason,
    ): void {
        $now = Carbon::now();

        if ($status === 'ARRIVED') {
            $routeStop->update([
                'status' => 'ARRIVED',
                'arrived_at' => $routeStop->arrived_at ?? $now,
                'completed_at' => null,
                'fail_reason' => null,
            ]);

            return;
        }

        if ($status === 'COMPLETED') {
            $routeStop->update([
                'status' => 'COMPLETED',
                'arrived_at' => $routeStop->arrived_at ?? $now,
                'completed_at' => $now,
                'fail_reason' => null,
            ]);

            $routeStop->order?->update([
                'status' => 'COMPLETED',
            ]);

            return;
        }

        $routeStop->update([
            'status' => 'FAILED',
            'arrived_at' => $routeStop->arrived_at ?? $now,
            'completed_at' => null,
            'fail_reason' => $failReason,
        ]);

        $routeStop->order?->update([
            'status' => 'FAILED',
        ]);
    }

    private function refreshRouteStatus(DeliveryRoute $deliveryRoute): void
    {
        $deliveryRoute->loadMissing('routeStops');

        $statuses = $deliveryRoute->routeStops->pluck('status');

        if ($statuses->isNotEmpty() && $statuses->every(fn (string $status) => $status === 'COMPLETED')) {
            $deliveryRoute->update([
                'status' => 'DONE',
            ]);

            return;
        }

        if ($statuses->contains(fn (string $status) => $status !== 'PENDING')) {
            $deliveryRoute->update([
                'status' => 'IN_PROGRESS',
            ]);

            return;
        }

        $deliveryRoute->update([
            'status' => 'PLANNED',
        ]);
    }

    private function authorizeCourierAccess(Request $request): void
    {
        abort_unless($request->user()?->isCourier(), 403);
    }
}
