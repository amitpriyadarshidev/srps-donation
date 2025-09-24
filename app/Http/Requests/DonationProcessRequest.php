<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DonationProcessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic donation information
            'country' => 'required|exists:countries,id',
            'currency' => 'required|exists:currencies,id',
            'amount' => 'required|numeric|min:1|max:999999.99',
            'purpose' => 'required|exists:purposes,id',
            
            // Address information
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'zip_code' => 'required|string|max:20',
            'state' => 'required|exists:states,id',
            
            // Personal information
            'first_name' => 'required|string|min:2|max:100|regex:/^[a-zA-Z\s]+$/',
            'middle_name' => 'nullable|string|max:100|regex:/^[a-zA-Z\s]+$/',
            'last_name' => 'required|string|min:2|max:100|regex:/^[a-zA-Z\s]+$/',
            // Removed DNS validation to prevent dns_get_record timeouts in local/offline env
            'email' => 'bail|required|email:rfc|max:255',
            'phone' => 'required|string|min:10|max:20|regex:/^[0-9\-\+\(\)\s]+$/',
            'phone_country_code' => 'required|string|min:1|max:10|regex:/^\+?[0-9]+$/',
            
            // KYC and tax information
            'skip_kyc' => 'nullable|boolean',
            'tax_exemption' => 'nullable|boolean',
            'pan_number' => [
                'nullable',
                'string',
                'size:10',
                'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
                Rule::requiredIf(function () {
                    return $this->input('tax_exemption') === true || $this->input('tax_exemption') === '1';
                })
            ],
            
            // Alternative payment method
            'alternative_method' => 'nullable|boolean',
            
            // Legal requirements
            'terms_accepted' => 'required|accepted',
            
            // File uploads (conditional on not skipping KYC)
            // If skip_kyc is 1/true, documents are not required and nested rules are excluded
            'documents' => 'required_unless:skip_kyc,1|array|min:1|max:5',
            'documents.*.type' => 'exclude_if:skip_kyc,1|required_with:documents|string|min:2|max:100',
            'documents.*.file' => 'exclude_if:skip_kyc,1|required_with:documents|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max per file
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Country and currency messages
            'country.required' => 'Please select your country.',
            'country.exists' => 'The selected country is invalid.',
            'currency.required' => 'Please select a currency.',
            'currency.exists' => 'The selected currency is invalid.',
            
            // Amount validation messages
            'amount.required' => 'Please enter a donation amount.',
            'amount.numeric' => 'The donation amount must be a valid number.',
            'amount.min' => 'The minimum donation amount is :min.',
            'amount.max' => 'The maximum donation amount is :max.',
            
            // Purpose validation
            'purpose.required' => 'Please select a donation purpose.',
            'purpose.exists' => 'The selected donation purpose is invalid.',
            
            // Address validation messages
            'address_line_1.required' => 'Address line 1 is required.',
            'address_line_1.max' => 'Address line 1 cannot exceed :max characters.',
            'address_line_2.max' => 'Address line 2 cannot exceed :max characters.',
            'city.required' => 'City is required.',
            'city.max' => 'City name cannot exceed :max characters.',
            'zip_code.required' => 'ZIP/Postal code is required.',
            'zip_code.max' => 'ZIP/Postal code cannot exceed :max characters.',
            'state.required' => 'State/Province is required.',
            'state.exists' => 'The selected state is invalid.',
            
            // Personal information messages
            'first_name.required' => 'First name is required.',
            'first_name.min' => 'First name must be at least :min characters.',
            'first_name.max' => 'First name cannot exceed :max characters.',
            'first_name.regex' => 'First name can only contain letters and spaces.',
            'middle_name.max' => 'Middle name cannot exceed :max characters.',
            'middle_name.regex' => 'Middle name can only contain letters and spaces.',
            'last_name.required' => 'Last name is required.',
            'last_name.min' => 'Last name must be at least :min characters.',
            'last_name.max' => 'Last name cannot exceed :max characters.',
            'last_name.regex' => 'Last name can only contain letters and spaces.',
            
            // Contact information messages
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address cannot exceed :max characters.',
            'phone.required' => 'Phone number is required.',
            'phone.min' => 'Phone number must be at least :min digits.',
            'phone.max' => 'Phone number cannot exceed :max digits.',
            'phone.regex' => 'Please enter a valid phone number.',
            'phone_country_code.required' => 'Country code is required.',
            'phone_country_code.regex' => 'Please enter a valid country code.',
            
            // PAN number validation messages
            'pan_number.required' => 'PAN number is required for tax exemption.',
            'pan_number.size' => 'PAN number must be exactly :size characters.',
            'pan_number.regex' => 'Please enter a valid PAN number (e.g., ABCDE1234F).',
            
            // Legal requirements
            'terms_accepted.required' => 'You must accept the terms and conditions.',
            'terms_accepted.accepted' => 'You must accept the terms and conditions to proceed.',
            
            // File upload messages
            'documents.required_unless' => 'At least one KYC document is required when KYC is not skipped.',
            'documents.min' => 'At least one KYC document is required.',
            'documents.max' => 'You can upload a maximum of :max KYC documents.',
            'documents.*.type.required_with' => 'Document type is required for each uploaded document.',
            'documents.*.type.min' => 'Document type must be at least :min characters.',
            'documents.*.type.max' => 'Document type cannot exceed :max characters.',
            'documents.*.file.required_with' => 'Document file is required for each document entry.',
            'documents.*.file.file' => 'Each KYC document must be a valid file.',
            'documents.*.file.mimes' => 'KYC documents must be PDF, JPG, JPEG, or PNG files.',
            'documents.*.file.max' => 'Each KYC document cannot exceed 5MB.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'country' => 'country',
            'currency' => 'currency',
            'amount' => 'donation amount',
            'purpose' => 'donation purpose',
            'address_line_1' => 'address line 1',
            'address_line_2' => 'address line 2',
            'city' => 'city',
            'zip_code' => 'ZIP/postal code',
            'state' => 'state',
            'first_name' => 'first name',
            'middle_name' => 'middle name',
            'last_name' => 'last name',
            'email' => 'email address',
            'phone' => 'phone number',
            'phone_country_code' => 'country code',
            'pan_number' => 'PAN number',
            'terms_accepted' => 'terms and conditions',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation: PAN number required if tax exemption is claimed
            if ($this->input('tax_exemption') && !$this->input('pan_number')) {
                $validator->errors()->add('pan_number', 'PAN number is required when claiming tax exemption.');
            }

            // Custom validation: Optional extra file integrity check only (avoid duplicating required messages)
            if (!$this->boolean('skip_kyc') && $this->has('documents') && is_array($this->input('documents'))) {
                foreach (array_keys($this->input('documents')) as $index) {
                    $uploadedFile = $this->file("documents.$index.file");
                    if ($uploadedFile instanceof \Illuminate\Http\UploadedFile && !$uploadedFile->isValid()) {
                        $validator->errors()->add("documents.{$index}.file", 'Uploaded document appears to be invalid or corrupted.');
                    }
                }
            }

            // Custom validation: Validate phone number format based on country
            if ($this->input('phone_country_code') === '+91' && $this->input('phone')) {
                $phone = preg_replace('/[^0-9]/', '', $this->input('phone'));
                if (strlen($phone) !== 10) {
                    $validator->errors()->add('phone', 'Indian phone numbers must be exactly 10 digits.');
                    $validator->errors()->add('phone_country_code', 'Please verify the country code for the phone number.');
                }
            }

            // Custom validation: Combined phone validation error
            if ($this->input('phone') && !$this->input('phone_country_code')) {
                $validator->errors()->add('phone_combined', 'Please select a country code for your phone number.');
            }

            // Custom validation: Email domain validation for specific countries
            if ($this->input('email') && $this->input('country')) {
                $email = $this->input('email');
                // Add any specific email domain validations if needed
            }
        });
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        // Log validation failures for debugging
        \Log::info('Donation form validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input' => $this->except(['password', 'password_confirmation'])
        ]);

        parent::failedValidation($validator);
    }
}
