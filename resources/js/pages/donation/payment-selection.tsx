import React, { useEffect, useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
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
  const [checking, setChecking] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

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
        <h1 className="text-3xl font-bold text-blue-800 mb-6 tracking-tight">Proceed to Payment</h1>
        {donation && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-blue-700">Donation Summary</h2>
              {donation ? (
                <Link
                  href={route('donation.edit', donation.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 text-xs font-semibold hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M5 19h3l9.293-9.293a1 1 0 0 0 0-1.414L13.707 4.707a1 1 0 0 0-1.414 0L3 14v3a2 2 0 0 0 2 2zm11.707-11.707 1.414 1.414" />
                  </svg>
                  Edit Details
                </Link>
              ) : null}
            </div>
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

        {/* Last transaction status (from session) */}
        {props.lastTransaction ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10zm1-10V7h-2v7h6v-2z" /></svg>
                <span className="font-semibold">Last Transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`uppercase inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${props.lastTransaction.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : props.lastTransaction.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  {props.lastTransaction.status}
                </span>
                <span className="text-xs font-medium">{new Date(props.lastTransaction.started_at || Date.now()).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
              <div className="sm:col-span-2 flex items-center gap-2 min-w-0">
                <span className="text-gray-600">Txn:</span>
                <span className="font-medium break-all">{props.lastTransaction.transaction_id}</span>
                <button
                  type="button"
                  title="Copy transaction ID"
                  aria-label="Copy transaction ID"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(String(props.lastTransaction.transaction_id || ''));
                      setCopiedTxn(true);
                      setTimeout(() => setCopiedTxn(false), 1500);
                    } catch (e) {
                      console.error(e);
                      alert('Copy failed');
                    }
                  }}
                  className="ml-1 inline-flex items-center rounded p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  {copiedTxn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-600">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
                    </svg>
                  )}
                </button>
                {copiedTxn ? (
                  <span className="text-[10px] font-semibold text-green-600">Copied</span>
                ) : null}
              </div>
              <div className="text-right"><span className="text-gray-600">Amount:</span> <span className="font-medium">{props.lastTransaction.currency || ''}{props.lastTransaction.amount}</span></div>
              <div><span className="text-gray-600">Gateway:</span> <span className="font-medium uppercase">{props.lastTransaction.gateway}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!donation) return;
                  try {
                    setChecking(true);
                    const xsrf = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
                    const csrfMeta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                    const headers: Record<string, string> = {
                      'X-Requested-With': 'XMLHttpRequest',
                      'Content-Type': 'application/json',
                    };
                    if (xsrf) headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);
                    if (csrfMeta) headers['X-CSRF-TOKEN'] = csrfMeta;
                    const res = await fetch(route('donation.status', donation.id), {
                      method: 'POST',
                      headers,
                      credentials: 'same-origin',
                      body: JSON.stringify({ transaction_id: props.lastTransaction.transaction_id }),
                    });
                    const data = await res.json();
                    if (data.ok && data.redirect) {
                      window.location.href = data.redirect;
                    } else if (data.ok) {
                      alert(`Status: ${data.status}`);
                      window.location.reload();
                    } else {
                      alert(data.message || 'Unable to check status');
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Error checking status');
                  } finally {
                    setChecking(false);
                  }
                }}
                disabled={checking || processing}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-white text-xs font-semibold ${checking || processing ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
              >
                {checking ? (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Checking…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 6v6l4 2-.8 1.6L10 13V6z" /></svg>
                    Check Status
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!donation) return;
                  setSelectedGateway(props.lastTransaction.gateway);
                  setProcessing(true);
                  // Trigger form submit programmatically
                  const form = document.querySelector('form[data-payment-form]') as HTMLFormElement | null;
                  form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }}
                disabled={processing || checking}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-white text-xs font-semibold ${processing ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {processing ? (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Retrying…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5v4l3-3-3-3v2zM3 13h2a7 7 0 0 0 14 0h2a9 9 0 0 1-18 0z" /></svg>
                    Retry Payment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        <h2 className="text-lg font-semibold text-blue-700 mb-3">Select Payment Method</h2>
        {gateways.length > 0 ? (
          <form
            data-payment-form
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

                const payload: any = { gateway: selectedGateway };
                if (props.lastTransaction && selectedGateway === props.lastTransaction.gateway) {
                  payload.retry_transaction_id = props.lastTransaction.transaction_id;
                }

                const res = await fetch(route('donation.pay', donation.id), {
                  method: 'POST',
                  headers,
                  credentials: 'same-origin',
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.ok && data.alreadyCompleted && data.redirect) {
                  window.location.href = data.redirect;
                  return;
                }
                if (data.ok && data.gateway === 'worldline') {
                  setProcessing(true);
                  // Initialize Worldline (opens in new window flow)
                  const result = await initWorldline(data.payload);
                  if (!result.ok) {
                    setProcessing(false);
                    alert(result.message || 'Worldline initialization failed.');
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
                className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${processing ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={!selectedGateway || processing}
              >
                {processing ? (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Processing…
                  </>
                ) : selectedGateway === props.lastTransaction?.gateway ? (
                  'Retry Payment'
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm">
            No payment gateways are currently available.
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