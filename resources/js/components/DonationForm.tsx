import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
  DonationFormData, 
  DonationFormProps, 
  FormErrors, 
  Country, 
  State,
  DonationDocument 
} from '@/types/donation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DonationForm: React.FC<DonationFormProps> = ({
  countries,
  currencies,
  purposes,
  detectedCountry,
  errors: serverErrors = {}
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    // Donation Details
    country: detectedCountry?.id || '',
    purpose: '',
    currency: detectedCountry?.default_currency || '',
    amount: '1',

    // Billing Address
    address_line_1: '',
    address_line_2: '',
    state: '',
    city: '',
    zip_code: '',

    // Donor Information
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    phone_country_code: detectedCountry?.phone_code || '',

    // Tax Exemption
    tax_exemption: false,
    pan_number: '',

    // KYC Documents
    documents: [{ type: '', file: null }],
    skip_kyc: false,

    // Terms
    terms_accepted: false,
  });

  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = useState<FormErrors>(serverErrors);
  const [isLoading, setIsLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [symbolWidth, setSymbolWidth] = useState(20);

  // Calculate dynamic padding for amount input based on currency symbol width
  const calculateSymbolWidth = (symbol: string) => {
    // Base width calculation for different symbol lengths and characters
    const baseWidth = 20;
    const charWidth = symbol.length * 8; // Approximate 8px per character
    const extraWidth = symbol.includes('₹') || symbol.includes('£') || symbol.includes('€') ? 4 : 0;
    return Math.max(baseWidth, charWidth + extraWidth + 16); // 16px for padding
  };

  // Prepare data for Combobox components
  const countryOptions: ComboboxOption[] = countries.map(country => ({
    value: country.id,
    label: country.name,
    extra: country.code
  }));

  const currencyOptions: ComboboxOption[] = currencies.map(currency => ({
    value: currency.id,
    label: `${currency.name} (${currency.code})`,
    extra: currency.symbol
  }));

  const purposeOptions: ComboboxOption[] = purposes.map(purpose => ({
    value: purpose.id,
    label: purpose.name,
    extra: (
      <div className="flex items-center gap-1">
        <span>{purpose.icon}</span>
        <span className="text-xs text-muted-foreground">{purpose.category}</span>
      </div>
    )
  }));

  const stateOptions: ComboboxOption[] = states.map(state => ({
    value: state.id,
    label: state.name,
    extra: state.code
  }));

  // Function to calculate the width needed for the ISD code dropdown
  const calculateCodeWidth = (code: string) => {
    // Base width for dropdown chrome
    const baseWidth = 80;
    // Additional width per character (approximate)
    const charWidth = 8;
    // Add some padding
    const padding = 16;
    
    return Math.max(baseWidth, (code?.length || 3) * charWidth + padding);
  };

  const phoneCodeOptions: ComboboxOption[] = countries.map(country => ({
    value: country.phone_code,
    label: `${country.flag_icon} ${country.phone_code}`
  }));

  // Load states when country changes
  const loadStates = async (countryId: string, selectedStateId?: string) => {
    if (!countryId) {
      setStates([]);
      return;
    }

    try {
      const response = await fetch(`/api/states?country_id=${countryId}`);
      const statesData = await response.json();
      setStates(statesData);
      
      if (selectedStateId) {
        setFormData(prev => ({ ...prev, state: selectedStateId }));
      } else {
        setFormData(prev => ({ ...prev, state: '' }));
      }
    } catch (error) {
      console.error('Failed to load states:', error);
      setStates([]);
    }
  };

  // Update currency symbol when currency changes
  useEffect(() => {
    if (formData.currency) {
      const currency = currencies.find(c => c.id === formData.currency);
      const symbol = currency?.symbol || '$';
      setCurrencySymbol(symbol);
      setSymbolWidth(calculateSymbolWidth(symbol));
    }
  }, [formData.currency, currencies]);

  // Load states for detected country on mount
  useEffect(() => {
    if (detectedCountry && detectedCountry.states) {
      setStates(detectedCountry.states);
    } else if (detectedCountry) {
      loadStates(detectedCountry.id);
    }
  }, [detectedCountry]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (countryId: string) => {
    handleInputChange('country', countryId);
    
    if (countryId) {
      const country = countries.find(c => c.id === countryId);
      if (country) {
        // Update currency
        handleInputChange('currency', country.default_currency);
        
        // Update phone country code
        const phoneCode = country.phone_code.startsWith('+') ? 
          country.phone_code : `+${country.phone_code}`;
        handleInputChange('phone_country_code', phoneCode);
        
        // Load states
        if (country.states) {
          setStates(country.states);
          setFormData(prev => ({ ...prev, state: '' }));
        } else {
          loadStates(countryId);
        }
      }
    } else {
      setStates([]);
      setFormData(prev => ({ ...prev, state: '' }));
    }
  };

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { type: '', file: null }]
    }));
  };

  const removeDocument = (index: number) => {
    if (formData.documents.length > 1) {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDocument = (index: number, field: 'type' | 'file', value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));

    // Clear specific document field error when user starts typing/selecting
    const errorKey = `documents.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        
        // Also clear general documents error if user is fixing individual document
        if (errors.documents && typeof errors.documents === 'string') {
          delete newErrors.documents;
        }
        
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'documents') {
          // Handle documents separately
          formData.documents.forEach((doc, index) => {
            formDataToSubmit.append(`documents[${index}][type]`, doc.type);
            if (doc.file) {
              formDataToSubmit.append(`documents[${index}][file]`, doc.file);
            }
          });
        } else if (typeof value === 'boolean') {
          formDataToSubmit.append(key, value ? '1' : '0');
        } else {
          formDataToSubmit.append(key, value.toString());
        }
      });

      router.post('/donation/process', formDataToSubmit, {
        onSuccess: () => {
          // Handle success - this will be handled by the backend redirect
        },
        onError: (errors) => {
          setErrors(errors);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head title="Donation Form" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Proceed to Pay
              </h1>
              <p className="text-gray-600">
                Complete your donation details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Donation Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🎁</span>
                    Donation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={countryOptions}
                      value={formData.country}
                      onValueChange={handleCountryChange}
                      placeholder="Select Country"
                      searchPlaceholder="Search countries..."
                      emptyText="No country found."
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>

                  {/* Purpose */}
                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={purposeOptions}
                      value={formData.purpose}
                      onValueChange={(value) => handleInputChange('purpose', value)}
                      placeholder="Select Purpose"
                      searchPlaceholder="Search donation purposes..."
                      emptyText="No purpose found."
                      className={errors.purpose ? 'border-red-500' : ''}
                    />
                    {errors.purpose && (
                      <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                    )}
                  </div>

                  {/* Currency */}
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={currencyOptions}
                      value={formData.currency}
                      onValueChange={(value) => handleInputChange('currency', value)}
                      placeholder="Select Currency"
                      searchPlaceholder="Search currencies..."
                      emptyText="No currency found."
                      className={errors.currency ? 'border-red-500' : ''}
                    />
                    {errors.currency && (
                      <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div 
                        className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"
                        style={{ width: `${symbolWidth + 12}px` }}
                      >
                        <span className="text-gray-500 text-sm font-medium">
                          {currencySymbol}
                        </span>
                      </div>
                      <Input
                        type="text"
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder={`Enter Amount to Pay`}
                        className={`${
                          errors.amount ? 'border-red-500' : ''
                        }`}
                        style={{ paddingLeft: `${symbolWidth + 12}px` }}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Processing fee as 5% of total amount would be charged.
                    </p>
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Billing Address Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">📍</span>
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address Line 1 */}
                  <div>
                    <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="address_line_1"
                      value={formData.address_line_1}
                      onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                      placeholder="Address 1"
                      className={`${
                        errors.address_line_1 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.address_line_1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.address_line_1}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <Input
                      type="text"
                      id="address_line_2"
                      value={formData.address_line_2}
                      onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                      placeholder="Address 2"
                      className={`${
                        errors.address_line_2 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.address_line_2 && (
                      <p className="mt-1 text-sm text-red-600">{errors.address_line_2}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={stateOptions}
                      value={formData.state}
                      onValueChange={(value) => handleInputChange('state', value)}
                      placeholder="Select State"
                      searchPlaceholder="Search states..."
                      emptyText="No state found."
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city name"
                      className={`${
                        errors.city ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                      Pin/Zip Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="Enter Pin/Zip Code"
                      className={`${
                        errors.zip_code ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.zip_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                    )}
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Donor Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">👤</span>
                    Donor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="First name"
                      className={`${
                        errors.first_name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <Input
                      type="text"
                      id="middle_name"
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                      placeholder="Middle name"
                      className={`${
                        errors.middle_name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.middle_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.middle_name}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Last name"
                      className={`${
                        errors.last_name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Your email"
                      className={`${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex rounded-md ${
                      errors.phone || errors.phone_country_code || errors.phone_combined 
                        ? 'ring-1 ring-red-300' 
                        : ''
                    }`}>
                      <div className="relative" style={{ 
                        minWidth: 'fit-content',
                        width: `${calculateCodeWidth(formData.phone_country_code)}px`
                      }}>
                        <Combobox
                          options={phoneCodeOptions}
                          value={formData.phone_country_code}
                          onValueChange={(value) => handleInputChange('phone_country_code', value)}
                          placeholder="Code"
                          searchPlaceholder="Search country codes..."
                          emptyText="No country found."
                          className="w-full rounded-r-none border-r-0 focus:border-r focus:z-10"
                        />
                      </div>
                      <Input
                        type="text"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Your Mobile Number"
                        className="flex-1 rounded-l-none -ml-px focus:z-10"
                      />
                    </div>
                    {(errors.phone || errors.phone_country_code || errors.phone_combined) && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone_combined || errors.phone || errors.phone_country_code}
                      </p>
                    )}
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Tax Exemption Section */}
              <Card>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tax_exemption"
                      checked={formData.tax_exemption}
                      onChange={(e) => handleInputChange('tax_exemption', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="tax_exemption" className="ml-2 text-sm text-gray-700">
                      I want a tax exemption receipt
                    </label>
                  </div>
                  
                  {formData.tax_exemption && (
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter PAN Number"
                        value={formData.pan_number}
                        onChange={(e) => handleInputChange('pan_number', e.target.value)}
                        className={`${
                          errors.pan_number ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.pan_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.pan_number}</p>
                      )}
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>

              {/* KYC Documents Section */}
              {!formData.skip_kyc && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">🆔</span>
                      KYC Documents
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDocument}
                      className="text-blue-700 border-blue-300 hover:bg-blue-50 w-full sm:w-auto"
                    >
                      ➕ Add Document
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload at least one government-issued identity document. You can add multiple documents if needed.
                  </p>
                  
                  {/* General KYC Documents Error */}
                  {errors.documents && typeof errors.documents === 'string' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.documents}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {formData.documents.map((document, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Document Type <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="text"
                              value={document.type}
                              onChange={(e) => updateDocument(index, 'type', e.target.value)}
                              placeholder="Enter Document Type"
                              className={`${
                                errors[`documents.${index}.type`] ? 'border-red-500' : ''
                              }`}
                            />
                            {errors[`documents.${index}.type`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`documents.${index}.type`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Document Copy <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => updateDocument(index, 'file', e.target.files?.[0] || null)}
                                className={`flex-1 min-w-0 h-9 px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:mr-2 border rounded-md shadow-xs bg-transparent transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                  errors[`documents.${index}.file`] ? 'border-red-500 aria-invalid:ring-destructive/20' : 'border-input'
                                }`}
                              />
                              {formData.documents.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                  className="flex-shrink-0 h-9 w-9 p-0 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </Button>
                              )}
                            </div>
                            {errors[`documents.${index}.file`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`documents.${index}.file`]}</p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Supported formats: JPG, PNG, PDF (Max 5MB each)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Upload Option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-blue-800">
                    <span className="mr-2">ℹ️</span>
                    <strong className="text-base">Alternative</strong>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm text-blue-700">
                      <p>
                        You can also email your documents to{' '}
                        <a 
                          href="mailto:doc@srpsshikshasamiti.com" 
                          className="underline hover:text-blue-900 font-medium"
                        >
                          doc@srpsshikshasamiti.com
                        </a>
                      </p>
                    </div>
                    <div className="flex items-center justify-start md:justify-end">
                      <input
                        type="checkbox"
                        id="skip_kyc"
                        checked={formData.skip_kyc}
                        onChange={(e) => handleInputChange('skip_kyc', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="skip_kyc" className="ml-2 text-sm font-medium text-blue-800">
                        I will provide documents via email
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                    className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                      errors.terms_accepted ? 'border-red-500' : ''
                    }`}
                  />
                  <label htmlFor="terms_accepted" className="ml-2 text-sm text-gray-700">
                    Check here to indicate that you have read and agree to the{' '}
                    <a href="#" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                      terms and conditions
                    </a>
                  </label>
                </div>
                {errors.terms_accepted && (
                  <p className="mt-1 text-sm text-red-600">{errors.terms_accepted}</p>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      💳 Pay Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationForm;