export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((cents, item) => cents + Math.round(item.amount * 100), 0) / 100;
}

export function subtractAmounts(left: number, right: number): number {
  return (Math.round(left * 100) - Math.round(right * 100)) / 100;
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function subscribeLocalDate(onChange: (date: string) => void): () => void {
  const update = () => onChange(dateKey(new Date()));
  const timer = setInterval(update, 30_000);
  window.addEventListener("focus", update);
  return () => {
    clearInterval(timer);
    window.removeEventListener("focus", update);
  };
}
