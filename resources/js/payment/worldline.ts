import { loadScript, type PaymentInitResult } from './base';

export type WorldlinePayload = {
  merchantCode: string;
  merchantSchemeCode: string;
  amount: string; // formatted
  currency: string;
  donationId: string;
  purpose: string;
  returnUrl: string;
  environment: 'test' | 'live';
};

export async function initWorldline(
  payload: WorldlinePayload,
  mountSelector?: string
): Promise<PaymentInitResult> {
  try {
    // NOTE: Replace with actual Worldline script URL if using widget
    const scriptUrl = payload.environment === 'live'
      ? 'https://www.paynimo.com/Paynimocheckout/live/sdk.js'
      : 'https://www.paynimo.com/Paynimocheckout/test/sdk.js';

    await loadScript(scriptUrl);

    // TODO: Replace with real Worldline init. For now, redirect placeholder or console log
    // If hosted checkout: construct a post/redirect here with payload
    console.log('Worldline SDK loaded, payload:', payload);

    // If embedding, mount into container
    if (mountSelector) {
      const el = document.querySelector(mountSelector);
      if (el) {
        el.innerHTML = '<div style="padding:12px;border:1px dashed #93c5fd;color:#1d4ed8;font-size:12px;">Worldline widget placeholder. Implement real init.</div>';
      }
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to initialize Worldline.' };
  }
}
