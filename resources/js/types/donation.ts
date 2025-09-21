export interface Country {
  id: string;
  name: string;
  code: string;
  default_currency: string;
  phone_code: string;
  flag_icon?: string;
  states?: State[];
}

export interface State {
  id: string;
  name: string;
  code: string;
  country_id: string;
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface Purpose {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
}

export interface DonationDocument {
  type: string;
  file: File | null;
}

export interface DonationFormData {
  // Donation Details
  country: string;
  purpose: string;
  currency: string;
  amount: string;

  // Billing Address
  address_line_1: string;
  address_line_2: string;
  state: string;
  city: string;
  zip_code: string;

  // Donor Information
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_country_code: string;

  // Tax Exemption
  tax_exemption: boolean;
  pan_number: string;

  // KYC Documents
  documents: DonationDocument[];
  skip_kyc: boolean;

  // Terms
  terms_accepted: boolean;
}

export interface FormErrors {
  [key: string]: string | string[];
}

export interface DonationFormProps {
  countries: Country[];
  currencies: Currency[];
  purposes: Purpose[];
  detectedCountry?: Country;
  errors?: FormErrors;
}

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: any;
}