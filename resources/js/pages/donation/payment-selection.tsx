import React from 'react';
import { usePage, Head, Link } from '@inertiajs/react';

interface Donation {
  id: string | number;
  amount: number;
  currency?: { code: string; symbol?: string } | null;
  purpose?: { name: string } | null;
}

type PageProps = {
  donation?: Donation;
  flash?: { success?: string };
} & Record<string, any>;

const PaymentSelection: React.FC = () => {
  const { props } = usePage<PageProps>();
  const donation = props.donation;
  const flash = props.flash || {};

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Head title="Payment Selection" />
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {flash.success && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm font-medium">
              {flash.success}
            </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Proceed to Payment</h1>
        {donation && (
          <div className="mb-6 text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Donation ID:</span> {donation.id}</p>
            <p><span className="font-medium">Amount:</span> {donation.currency?.symbol || ''}{donation.amount} {donation.currency?.code}</p>
            {donation.purpose && <p><span className="font-medium">Purpose:</span> {donation.purpose.name}</p>}
          </div>
        )}
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Thank you for your generous donation. Please select your preferred payment method below to complete the transaction.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button className="w-full inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Card / UPI
          </button>
          <button className="w-full inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Bank Transfer
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-500">
          <p>You will receive a confirmation email after successful payment.</p>
          <p className="mt-2">Need help? <Link href="/support" className="text-blue-600 hover:underline">Contact support</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;