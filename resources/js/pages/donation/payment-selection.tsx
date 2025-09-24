import React, { useEffect, useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import { initWorldline } from '@/payment/worldline';
import DonationLayout from '@/layouts/donation-layout';

interface Donation {
  id: string | number;
  amount: number;
  currency?: { code: string; symbol?: string } | null;
  purpose?: { name: string } | null;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
}

interface Gateway {
  id: number;
  name: string;
  code: string;
  logo?: string | null;
  description?: string | null;
  is_default?: boolean;
  is_active?: boolean;
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
  const [selectedGateway, setSelectedGateway] = useState<string | null>(
    gateways.find((g) => g.is_default)?.code || gateways[0]?.code || null
  );
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!donation) return;
    // Expose donationData similar to Blade
    (window as any).donationData = {
      donation_id: donation.id,
      amount: donation.amount,
      currency: donation.currency?.code,
      donor_name: `${donation.first_name ?? ''} ${donation.last_name ?? ''}`.trim(),
      email: donation.email,
      phone: `${donation.phone_country_code ?? ''}${donation.phone ?? ''}`,
      purpose: donation.purpose?.name,
    };
  }, [donation]);

  return (
    <DonationLayout title="Payment">
      <Head title="Payment Selection" />
  <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {flash.success && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700/40 px-4 py-3 text-green-800 dark:text-green-300 text-sm font-medium">
              {flash.success}
            </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">Proceed to Payment</h1>
        {donation && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-blue-700 mb-3">Donation Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-2 w-1/3 font-medium">Name:</td>
                    <td className="border border-gray-200 p-2">{`${donation.first_name ?? ''} ${donation.middle_name ?? ''} ${donation.last_name ?? ''}`.replace(/\s+/g, ' ').trim()}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-medium">Email:</td>
                    <td className="border border-gray-200 p-2">{donation.email ?? '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-medium">Phone:</td>
                    <td className="border border-gray-200 p-2">{`${donation.phone_country_code ?? ''}${donation.phone ?? ''}` || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-medium">Amount:</td>
                    <td className="border border-gray-200 p-2">{donation.currency?.symbol || ''}{Number(donation.amount).toFixed(2)}</td>
                  </tr>
                  {donation.purpose && (
                    <tr>
                      <td className="border border-gray-200 p-2 font-medium">Purpose:</td>
                      <td className="border border-gray-200 p-2">{donation.purpose.name}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-gray-200 p-2 font-medium">Processing Fee (5%):</td>
                    <td className="border border-gray-200 p-2">{donation.currency?.symbol || ''}{(Number(donation.amount) * 0.05).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2 font-semibold">Total Amount:</td>
                    <td className="border border-gray-200 p-2 font-semibold">{donation.currency?.symbol || ''}{(Number(donation.amount) * 1.05).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-blue-700 mb-3">Select Payment Method</h2>
        {gateways.length > 0 ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!donation || !selectedGateway) return;
              try {
                // Try to read XSRF-TOKEN cookie (set by Laravel when using VerifyCsrfToken)
                const xsrf = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
                const csrfMeta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                const headers: Record<string, string> = {
                  'X-Requested-With': 'XMLHttpRequest',
                  'Content-Type': 'application/json',
                };
                if (xsrf) headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);
                if (csrfMeta) headers['X-CSRF-TOKEN'] = csrfMeta;

                const res = await fetch(route('donation.pay', donation.id), {
                  method: 'POST',
                  headers,
                  credentials: 'same-origin',
                  body: JSON.stringify({ gateway: selectedGateway }),
                });
                const data = await res.json();
                if (data.ok && data.gateway === 'worldline') {
                  setProcessing(true);
                  // Initialize Worldline and mount into container
                  const result = await initWorldline(data.payload, '#paymentGatewayContainer');
                  if (!result.ok) {
                    setProcessing(false);
                    alert(result.message || 'Worldline initialization failed.');
                  } else {
                    // scroll to processing container
                    const container = document.getElementById('paymentProcessingContainer');
                    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                } else {
                  alert(data.message || 'Unable to begin payment.');
                }
              } catch (err) {
                console.error(err);
                alert('Error initiating payment.');
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {gateways.map((g) => {
                const disabled = !g.is_active;
                const checked = selectedGateway === g.code;
                return (
                  <label
                    key={g.id}
                    data-gateway={g.code}
                    className={`cursor-pointer rounded-lg border p-4 text-sm transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} ${checked ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/40' : 'border-gray-300 bg-white'}`}
                  >
                    <div className="text-center">
                      <div className="mb-3 h-8 flex items-center justify-center">
                        {g.logo && !logoError[g.code] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/images/${g.logo}`}
                            alt={`${g.name}`}
                            className="h-8 object-contain"
                            onError={() => setLogoError((prev) => ({ ...prev, [g.code]: true }))}
                          />
                        ) : (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className={`h-8 w-8 ${disabled ? 'text-gray-400' : 'text-blue-600'}`}
                            fill="currentColor"
                          >
                            <path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 4v8h18V9H3zm2-3a1 1 0 0 0-1 1v1h18V7a1 1 0 0 0-1-1H5z" />
                          </svg>
                        )}
                      </div>
                      <div className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>{g.name}</div>
                      {g.description ? (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-3">{g.description}</p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <input
                          className="h-4 w-4"
                          type="radio"
                          name="gateway"
                          id={g.code}
                          value={g.code}
                          disabled={disabled}
                          checked={checked}
                          onChange={() => setSelectedGateway(g.code)}
                        />
                        <span className={`select-none ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                          <strong>Pay with {g.name}</strong>
                        </span>
                        {g.is_default ? (
                          <span className="ml-2 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">Default</span>
                        ) : null}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                disabled={!selectedGateway || processing}
              >
                {processing ? 'Processing…' : 'Proceed to Payment'}
              </button>
              <Link
                href={route('home')}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-gray-700 text-sm font-semibold hover:bg-gray-50 ml-2"
              >
                Back to Form
              </Link>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm">
            No payment gateways are currently available.
          </div>
        )}
        {/* Processing container for gateway widget */}
        <div className={`mt-8 ${processing ? '' : 'hidden'}`} id="paymentProcessingContainer">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-blue-800">Processing Payment</h4>
              <p className="text-blue-700 text-sm">Please complete your payment using the selected gateway</p>
            </div>
            <div className="rounded-md border border-dashed border-blue-300 bg-white p-4">
              <div id="paymentGatewayContainer" className="min-h-[120px]" />
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500 dark:text-neutral-500">
          <p className="dark:text-neutral-400">You will receive a confirmation email after successful payment.</p>
          <p className="mt-2 dark:text-neutral-400">Need help? <Link href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</Link>.</p>
        </div>
      </div>
    </DonationLayout>
  );
};

export default PaymentSelection;