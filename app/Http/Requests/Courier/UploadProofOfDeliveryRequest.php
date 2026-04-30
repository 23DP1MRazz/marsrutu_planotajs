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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => __('validation.custom.file.too_large'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var RouteStop $routeStop */
            $routeStop = $this->route('routeStop');

            if (! in_array($routeStop->status, ['COMPLETED', 'FAILED'], true)) {
                $validator->errors()->add(
                    'file',
                    __('validation.custom.file.proof_status'),
                );
            }
        });
    }
}
