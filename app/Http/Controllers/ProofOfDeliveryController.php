<?php

namespace App\Http\Controllers;

use App\Models\ProofOfDelivery;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProofOfDeliveryController extends Controller
{
    public function show(ProofOfDelivery $proofOfDelivery): BinaryFileResponse
    {
        $this->authorize('view', $proofOfDelivery);

        $path = $this->storagePath($proofOfDelivery->file_url);

        abort_unless(Storage::disk('public')->exists($path), 404);

        return response()->file(Storage::disk('public')->path($path));
    }

    private function storagePath(string $fileUrl): string
    {
        $path = parse_url($fileUrl, PHP_URL_PATH);

        if (is_string($path) && str_starts_with($path, '/storage/')) {
            return substr($path, strlen('/storage/'));
        }

        if (str_starts_with($fileUrl, '/storage/')) {
            return substr($fileUrl, strlen('/storage/'));
        }

        return ltrim($fileUrl, '/');
    }
}
