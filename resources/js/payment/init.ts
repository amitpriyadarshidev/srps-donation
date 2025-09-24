import { initWorldline } from '@/payment/worldline';

export type InitResult = { ok: boolean; message?: string };

const registry: Record<string, (payload: any) => Promise<InitResult>> = {
  worldline: initWorldline,
};

function submitForm(action: string, method: string, fields: Record<string, any>) {
  const form = document.createElement('form');
  form.method = method || 'POST';
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
  document.body.removeChild(form);
}

export async function initGateway(code: string, payload: any): Promise<InitResult> {
  const handler = registry[code];
  if (handler) return handler(payload);

  try {
    if (payload?.url) {
      window.location.href = payload.url;
      return { ok: true };
    }
    if (payload?.form?.action) {
      submitForm(payload.form.action, payload.form.method || 'POST', payload.form.fields || {});
      return { ok: true };
    }
  } catch (e) {
    console.error(e);
    return { ok: false, message: 'Failed to initialize payment.' };
  }

  return { ok: false, message: `No client initializer for gateway: ${code}` };
}
