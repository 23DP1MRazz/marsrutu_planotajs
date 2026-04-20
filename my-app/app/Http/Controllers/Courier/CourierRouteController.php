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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourierRouteController extends Controller
{
    public function showPage(Request $request): Response
    {
        return $this->renderRoutePage($request, false);
    }

    public function showDashboard(Request $request): Response
    {
        return $this->renderRoutePage($request, true);
    }

    public function showCompletedRoutesPage(Request $request): Response
    {
        $this->authorizeCourierAccess($request);

        return Inertia::render('courier/routes', [
            'title' => 'Done routes',
            'description' => 'Review routes you already finished.',
            'emptyMessage' => 'You have no completed routes yet.',
            'routes' => $this->completedRoutesForUser($request),
        ]);
    }

    public function showUpcomingRoutesPage(Request $request): Response
    {
        $this->authorizeCourierAccess($request);

        return Inertia::render('courier/routes', [
            'title' => 'Upcoming routes',
            'description' => 'See routes assigned to you after today.',
            'emptyMessage' => 'No upcoming routes assigned yet.',
            'routes' => $this->upcomingRoutesForUser($request),
        ]);
    }

    public function showCompletedOrdersPage(Request $request): Response
    {
        $this->authorizeCourierAccess($request);

        return Inertia::render('courier/completed-orders', [
            'orders' => $this->completedOrdersForUser($request),
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

        return to_route('dashboard');
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

        return to_route('dashboard');
    }

    private function renderRoutePage(Request $request, bool $dashboardMode): Response
    {
        $this->authorizeCourierAccess($request);

        $deliveryRoute = $this->todayRouteForUser($request);

        return Inertia::render('courier/route', [
            'deliveryRoute' => $deliveryRoute ? $this->formatRoute($deliveryRoute) : null,
            'stops' => $deliveryRoute ? $this->formatStops($deliveryRoute) : [],
            'dashboardMode' => $dashboardMode,
            'dashboardSummary' => $dashboardMode
                ? $this->dashboardSummaryForUser($request)
                : null,
        ]);
    }

    /**
     * @return array{
     *     done_routes: int,
     *     completed_orders: int,
     *     upcoming_routes_count: int,
     *     upcoming_routes: Collection<int, array{id: int, date: string, status: string, stops_count: int}>
     * }
     */
    private function dashboardSummaryForUser(Request $request): array
    {
        $upcomingRoutes = $this->upcomingRoutesQuery($request)
            ->limit(3)
            ->get();

        return [
            'done_routes' => $this->completedRoutesQuery($request)->count(),
            'completed_orders' => $this->completedOrdersQuery($request)->count(),
            'upcoming_routes_count' => $this->upcomingRoutesQuery($request)->count(),
            'upcoming_routes' => $this->formatRouteList($upcomingRoutes),
        ];
    }

    private function completedRoutesForUser(Request $request): array
    {
        return $this->formatRouteList(
            $this->completedRoutesQuery($request)->get(),
        );
    }

    private function upcomingRoutesForUser(Request $request): array
    {
        return $this->formatRouteList(
            $this->upcomingRoutesQuery($request)->get(),
        );
    }

    private function completedOrdersForUser(Request $request): array
    {
        return $this->completedOrdersQuery($request)
            ->get()
            ->map(fn (RouteStop $routeStop) => [
                'route_stop_id' => $routeStop->id,
                'route_id' => $routeStop->route_id,
                'order_id' => $routeStop->order_id,
                'route_date' => $routeStop->route?->date,
                'client_name' => $routeStop->order?->client?->name,
                'address_label' => collect([
                    $routeStop->order?->address?->city,
                    $routeStop->order?->address?->street,
                ])->filter()->join(', '),
                'status' => $routeStop->status,
                'completed_at' => $routeStop->completed_at,
                'proof_view_url' => $routeStop->proofOfDelivery
                    ? route('proof-of-delivery.show', $routeStop->proofOfDelivery)
                    : null,
            ])
            ->values()
            ->all();
    }

    private function completedRoutesQuery(Request $request)
    {
        return DeliveryRoute::query()
            ->where('organization_id', $request->user()->organization_id)
            ->where('courier_user_id', $request->user()->id)
            ->where('status', 'DONE')
            ->withCount('routeStops')
            ->orderByDesc('date');
    }

    private function upcomingRoutesQuery(Request $request)
    {
        return DeliveryRoute::query()
            ->where('organization_id', $request->user()->organization_id)
            ->where('courier_user_id', $request->user()->id)
            ->where('date', '>', Carbon::today()->toDateString())
            ->withCount('routeStops')
            ->orderBy('date');
    }

    private function completedOrdersQuery(Request $request)
    {
        return RouteStop::query()
            ->with([
                'route:id,date',
                'proofOfDelivery:id,route_stop_id,file_url',
                'order.client:id,name',
                'order.address:id,city,street',
            ])
            ->where('organization_id', $request->user()->organization_id)
            ->where('status', 'COMPLETED')
            ->whereHas('route', fn ($query) => $query
                ->where('organization_id', $request->user()->organization_id)
                ->where('courier_user_id', $request->user()->id))
            ->orderByDesc('completed_at')
            ->orderByDesc('id');
    }

    /**
     * @param  Collection<int, DeliveryRoute>  $deliveryRoutes
     * @return array<int, array{id: int, date: string, status: string, stops_count: int}>
     */
    private function formatRouteList(Collection $deliveryRoutes): array
    {
        return $deliveryRoutes
            ->map(fn (DeliveryRoute $deliveryRoute) => [
                'id' => $deliveryRoute->id,
                'date' => $deliveryRoute->date,
                'status' => $deliveryRoute->status,
                'stops_count' => $deliveryRoute->route_stops_count,
            ])
            ->values()
            ->all();
    }

    private function todayRouteForUser(Request $request): ?DeliveryRoute
    {
        return DeliveryRoute::query()
            ->with([
                'routeStops' => fn ($query) => $query->orderBy('seq_no'),
                'routeStops.proofOfDelivery',
                'routeStops.order.client:id,name',
                'routeStops.order.address:id,city,street,lat,lng',
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
     * @return Collection<int, array{id: int, seq_no: int, order_id: int, planned_eta: mixed, arrived_at: mixed, completed_at: mixed, status: string, fail_reason: string|null, proof_file_url: string|null, proof_view_url: string|null, client_name: string|null, address_label: string, lat: float|null, lng: float|null, google_maps_url: string, waze_url: string}>
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
            'proof_view_url' => $routeStop->proofOfDelivery
                ? route('proof-of-delivery.show', $routeStop->proofOfDelivery)
                : null,
            'client_name' => $routeStop->order?->client?->name,
            'address_label' => collect([
                $routeStop->order?->address?->city,
                $routeStop->order?->address?->street,
            ])->filter()->join(', '),
            'lat' => $routeStop->order?->address?->lat !== null
                ? (float) $routeStop->order->address->lat
                : null,
            'lng' => $routeStop->order?->address?->lng !== null
                ? (float) $routeStop->order->address->lng
                : null,
            'google_maps_url' => $this->googleMapsUrlForStop($routeStop),
            'waze_url' => $this->wazeUrlForStop($routeStop),
        ]);
    }

    private function googleMapsUrlForStop(RouteStop $routeStop): string
    {
        $address = $routeStop->order?->address;

        if ($address?->lat !== null && $address->lng !== null) {
            return 'https://www.google.com/maps/search/?api=1&query='
                .rawurlencode((string) $address->lat.','.(string) $address->lng);
        }

        return 'https://www.google.com/maps/search/?api=1&query='
            .rawurlencode($this->addressQueryForStop($routeStop));
    }

    private function wazeUrlForStop(RouteStop $routeStop): string
    {
        $address = $routeStop->order?->address;

        if ($address?->lat !== null && $address->lng !== null) {
            return 'https://waze.com/ul?ll='
                .rawurlencode((string) $address->lat.','.(string) $address->lng)
                .'&navigate=yes';
        }

        return 'https://waze.com/ul?q='
            .rawurlencode($this->addressQueryForStop($routeStop))
            .'&navigate=yes';
    }

    private function addressQueryForStop(RouteStop $routeStop): string
    {
        return collect([
            $routeStop->order?->address?->street,
            $routeStop->order?->address?->city,
            'Latvia',
        ])->filter()->join(', ');
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
