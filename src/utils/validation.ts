const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validatePanFormat(pan: string): boolean {
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

export function formatPanInput(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
}

// TODO: verify PAN via backend API (e.g. Surepass/Karza)

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
