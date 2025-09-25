import { loadScript, type PaymentInitResult } from './base';

export type EasebuzzPayload = {
  ezcheckout?: {
    access_key: string;
    key: string; // merchant key
    env: 'test' | 'prod';
  };
  environment?: 'test' | 'live';
  returnUrl: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { EasebuzzCheckout?: any }
}

export async function initEasebuzz(payload: EasebuzzPayload): Promise<PaymentInitResult> {
  try {
    const ez = payload.ezcheckout;
    if (!ez || !ez.access_key || !ez.key) {
      // Fallback: if no iframe data, let outer handler redirect using payload.url
      return { ok: false, message: 'Easebuzz iframe payload missing.' };
    }

    await loadScript('https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/easebuzz-checkout.js');

    const env = ez.env === 'prod' ? 'prod' : 'test';
    const Checkout = (window as any).EasebuzzCheckout;
    if (typeof Checkout !== 'function') {
      return { ok: false, message: 'Easebuzz checkout script not available.' };
    }

    const checkout = new Checkout(ez.key, env);
    const postToServer = (action: string, fields: Record<string, any>) => {
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;
        form.style.display = 'none';
        Object.entries(fields || {}).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = typeof v === 'string' ? v : JSON.stringify(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => document.body.removeChild(form), 1000);
      } catch (err) {
        console.error('Easebuzz postToServer error', err);
        // Fallback to GET redirect
        window.location.href = action;
      }
    };
    const options = {
      access_key: ez.access_key,
      onResponse: (res: any) => {
        try {
          // Send gateway response back to our server for verification
          if (res && typeof res === 'object') {
            postToServer(payload.returnUrl, res);
          } else {
            window.location.href = payload.returnUrl;
          }
        } catch (err) {
          console.error('Easebuzz onResponse error', err);
        }
      },
      theme: '#0F6CBD',
    } as any;
    checkout.initiatePayment(options);
    return { ok: true };
  } catch (e: any) {
    console.error('Easebuzz init error', e);
    return { ok: false, message: e?.message || 'Failed to initialize Easebuzz.' };
  }
}
