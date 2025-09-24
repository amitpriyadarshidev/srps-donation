import React, { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import DonationLayout from '@/layouts/donation-layout';

interface Donation {
  id: number | string;
  amount: number;
  currency?: { code: string; symbol?: string } | null;
  purpose?: { name: string } | null;
  country?: { name: string } | null;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  city?: string;
}

interface PageProps extends Record<string, any> {
  donation?: Donation;
  flash?: { success?: string; error?: string };
}

const ConfirmationPage: React.FC = () => {
  const { props } = usePage<PageProps>();
  const donation = props.donation;
  const flash = props.flash || {};
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  if (!donation) {
    return (
      <DonationLayout title="Payment Successful">
        <Head title="Payment Successful" />
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Payment Successful</h1>
          <p className="mt-2 text-gray-600">We could not find donation details. Please return to the home page.</p>
          <div className="mt-6">
            <Link href={route('home')} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">Go Home</Link>
          </div>
        </div>
      </DonationLayout>
    );
  }

  const fee = Number(donation.amount) * 0.05;
  const total = Number(donation.amount) + fee;

  return (
    <DonationLayout title="Payment Successful">
      <Head title="Payment Successful" />
      <div className="max-w-4xl mx-auto">
        {flash.success && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm font-medium">{flash.success}</div>
        )}
        {flash.error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm font-medium">{flash.error}</div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 15.586l7.293-7.293a1 1 0 111.414 1.414l-8 8A1 1 0 0110 18z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">Thank you for your generous donation. Your payment has been processed successfully.</p>

          <div ref={printRef} className="mt-6 text-left">
            <div className="rounded-lg border bg-white">
              <div className="border-b px-4 py-3">
                <h2 className="text-lg font-semibold text-blue-700">Transaction Summary</h2>
              </div>
              <div className="px-4 py-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 w-1/3 font-medium text-gray-700">Donation ID:</td>
                      <td className="py-2">{donation.id}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">Amount:</td>
                      <td className="py-2">{donation.currency?.symbol || ''}{Number(donation.amount).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">Processing Fee:</td>
                      <td className="py-2">{donation.currency?.symbol || ''}{fee.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-green-50">
                      <td className="py-2 font-semibold text-gray-900">Total Paid:</td>
                      <td className="py-2 font-semibold text-gray-900">{donation.currency?.symbol || ''}{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border bg-white mt-6">
              <div className="border-b px-4 py-3">
                <h2 className="text-lg font-semibold text-blue-700">Donation Details</h2>
              </div>
              <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm"><span className="font-medium text-gray-700">Name:</span> {`${donation.first_name ?? ''} ${donation.middle_name ?? ''} ${donation.last_name ?? ''}`.replace(/\s+/g, ' ').trim()}</p>
                  <p className="text-sm mt-1"><span className="font-medium text-gray-700">Email:</span> {donation.email}</p>
                  <p className="text-sm mt-1"><span className="font-medium text-gray-700">Phone:</span> {`${donation.phone_country_code ?? ''}${donation.phone ?? ''}`}</p>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium text-gray-700">Purpose:</span> {donation.purpose?.name || '-'}</p>
                  <p className="text-sm mt-1"><span className="font-medium text-gray-700">Country:</span> {donation.country?.name || '-'}</p>
                  <p className="text-sm mt-1"><span className="font-medium text-gray-700">City:</span> {donation.city || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href={route('home')} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">Make Another Donation</Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              Print Receipt
            </button>
            <a
              href={`mailto:${donation.email}`}
              className="inline-flex items-center rounded-md border border-green-300 px-4 py-2 text-green-700 text-sm font-semibold hover:bg-green-50"
            >
              Email Receipt
            </a>
          </div>

          <div className="mt-8 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm">
            Your donation will make a significant impact. We will send you a confirmation email shortly with all the details. If you have any questions, please contact us.
          </div>
        </div>
      </div>
    </DonationLayout>
  );
};

export default ConfirmationPage;
