import { loadScript, type PaymentInitResult } from './base';

export type WorldlinePayload = {
  form_data: Record<string, any>;
  mer_array: Record<string, any>;
  environment: 'test' | 'live';
  returnUrl: string;
};

function configFromPayload(payload: WorldlinePayload) {
  const mer = payload.mer_array || {};
  const fd = payload.form_data || {};
  return {
    tarCall: false,
    features: {
      showPGResponseMsg: true,
      enableNewWindowFlow: true,
      enableAbortResponse: true,
      enableExpressPay: mer.enableExpressPay == 1,
      enableInstrumentDeRegistration: mer.enableInstrumentDeRegistration == 1,
      enableMerTxnDetails: true,
      siDetailsAtMerchantEnd: mer.enableSIDetailsAtMerchantEnd == 1,
      enableSI: mer.enableEmandate == 1,
      hideSIDetails: mer.hideSIConfirmation == 1,
      enableDebitDay: mer.enableDebitDay == 1,
      expandSIDetails: mer.expandSIDetails == 1,
      enableTxnForNonSICards: mer.enableTxnForNonSICards == 1,
      showSIConfirmation: mer.showSIConfirmation == 1,
      showSIResponseMsg: mer.showSIResponseMsg == 1,
    },
    consumerData: {
      deviceId: 'WEBSH2',
      token: fd.hash || '',
      returnUrl: payload.returnUrl,
      responseHandler: (response: any) => {
        // Basic success/failure detection based on stringResponse
        try {
          if (response && response.stringResponse) {
            const parts = String(response.stringResponse).split('|');
            if (parts[0] === '0300') {
              // Let server handle redirect on callback URL
              // No-op here
            } else {
              alert('Payment failed or cancelled.');
            }
          }
        } catch (err) {
          console.error('Worldline response handler error', err);
        }
      },
      paymentMode: mer.paymentMode || 'all',
      checkoutElement: '',
      merchantLogoUrl: mer.logoURL || '',
      merchantId: fd.marchantId || '',
      currency: fd.currencycode || 'INR',
      consumerId: fd.consumerId || '',
      consumerMobileNo: fd.mobileNumber || '',
      consumerEmailId: fd.email || '',
      txnId: fd.txnId || '',
      items: [{ itemId: fd.schemecode || '', amount: fd.amount || '', comAmt: '0' }],
      customStyle: {
        PRIMARY_COLOR_CODE: mer.primaryColor || 'red',
        SECONDARY_COLOR_CODE: mer.secondaryColor || 'white',
        BUTTON_COLOR_CODE_1: mer.buttonColor1 || 'red',
        BUTTON_COLOR_CODE_2: mer.buttonColor2 || 'white',
      },
      accountNo: fd.accNo || '',
      accountHolderName: fd.accountName || '',
      ifscCode: fd.ifscCode || '',
      accountType: fd.accountType || '',
      debitStartDate: fd.debitStartDate || '',
      debitEndDate: fd.debitEndDate || '',
      maxAmount: fd.maxAmount || '',
      amountType: fd.amountType || '',
      frequency: fd.frequency || '',
      merchantMsg: mer.merchantMessage || '',
      disclaimerMsg: mer.disclaimerMessage || '',
      saveInstrument: mer.saveInstrument == 1,
      paymentModeOrder: mer.paymentModeOrder ? String(mer.paymentModeOrder).split(',') : [
        'wallets', 'cards', 'netBanking', 'imps', 'cashCards', 'UPI', 'MVISA', 'debitPin', 'NEFTRTGS', 'emiBanks'
      ],
    },
  } as any;
}

export async function initWorldline(
  payload: WorldlinePayload
): Promise<PaymentInitResult> {
  try {
    // Ensure jQuery is present as Paynimo expects it
    if (!(window as any).jQuery) {
      await loadScript('https://www.paynimo.com/paynimocheckout/client/lib/jquery.min.js');
    }
    await loadScript('https://www.paynimo.com/Paynimocheckout/server/lib/checkout.js');

    const configJson = configFromPayload(payload);

    await new Promise<void>((resolve) => {
      (window as any).$(document).ready(() => {
        try {
          (window as any).$.pnCheckout(configJson);
          setTimeout(() => {
            try {
              if (configJson.features.enableNewWindowFlow) {
                (window as any).pnCheckoutShared.openNewWindow();
              }
            } catch {}
            resolve();
          }, 50);
        } catch (err) {
          console.error('Worldline init error', err);
          resolve();
        }
      });
    });

    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to initialize Worldline.' };
  }
}
