<?php

namespace App\Http\Requests\Courier;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Models\RouteStop;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UploadProofOfDeliveryRequest extends FormRequest
{
    use LocalizesValidationAttributes;

    public function authorize(): bool
    {
        $routeStop = $this->route('routeStop');

        return $routeStop instanceof RouteStop
            && ($this->user()?->can('update', $routeStop) ?? false);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var RouteStop $routeStop */
            $routeStop = $this->route('routeStop');
            $routeStop->loadMissing('proofOfDelivery');

            if (! in_array($routeStop->status, ['COMPLETED', 'FAILED'], true)) {
                $validator->errors()->add(
                    'file',
                    __('validation.custom.file.proof_status'),
                );
            }

            if ($routeStop->proofOfDelivery !== null) {
                $validator->errors()->add(
                    'file',
                    __('validation.custom.file.proof_exists'),
                );
            }
        });
    }
}
