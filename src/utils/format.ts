export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDiscount(mrp: number, sellingPrice: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 4) + ' XXX XXX ' + phone.slice(-2);
}

export function getPrepTimeRemaining(deadline?: string): string {
  if (!deadline) return '--:--';
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return '00:00';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
