import React from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import DonationLayout from '@/layouts/donation-layout';

interface Donation {
  id: string | number;
  amount: number;
  currency?: { code: string; symbol?: string } | null;
  purpose?: { name: string } | null;
}

interface Gateway {
  id: number;
  name: string;
  code: string;
  logo?: string | null;
  description?: string | null;
  is_default?: boolean;
}

type PageProps = {
  donation?: Donation;
  flash?: { success?: string };
  gateways?: Gateway[];
} & Record<string, any>;

const PaymentSelection: React.FC = () => {
  const { props } = usePage<PageProps>();
  const donation = props.donation;
  const flash = props.flash || {};
  const gateways = props.gateways || [];

  return (
    <DonationLayout title="Payment">
      <Head title="Payment Selection" />
  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {flash.success && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700/40 px-4 py-3 text-green-800 dark:text-green-300 text-sm font-medium">
              {flash.success}
            </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">Proceed to Payment</h1>
        {donation && (
          <div className="mb-6 text-sm text-gray-700 dark:text-neutral-300 space-y-1">
            <p><span className="font-medium">Donation ID:</span> {donation.id}</p>
            <p><span className="font-medium">Amount:</span> {donation.currency?.symbol || ''}{donation.amount} {donation.currency?.code}</p>
            {donation.purpose && <p><span className="font-medium">Purpose:</span> {donation.purpose.name}</p>}
          </div>
        )}
        <p className="text-gray-600 dark:text-neutral-400 mb-6 text-sm leading-relaxed">
          Thank you for your generous donation. Please select your preferred payment method below to complete the transaction.
        </p>
        {gateways.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {gateways.map((g) => (
              <button
                key={g.id}
                className="w-full text-left inline-flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {g.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/${g.logo}`} alt={`${g.name} logo`} className="h-6 w-6 object-contain" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{g.name}</span>
                    {g.is_default ? (
                      <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">Default</span>
                    ) : null}
                  </div>
                  {g.description ? (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm">
            No payment gateways configured. Please contact support.
          </div>
        )}
        <div className="mt-8 text-xs text-gray-500 dark:text-neutral-500">
          <p className="dark:text-neutral-400">You will receive a confirmation email after successful payment.</p>
          <p className="mt-2 dark:text-neutral-400">Need help? <Link href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</Link>.</p>
        </div>
      </div>
    </DonationLayout>
  );
};

export default PaymentSelection;