export function formatRelativeTime(dateInput?: string | number | Date): string {
  if (!dateInput) return 'Just now';

  const strInput = String(dateInput).trim();
  if (
    strInput === 'Just now' ||
    strInput === 'Sponsored' ||
    strInput.endsWith(' ago') ||
    strInput.endsWith('m ago') ||
    strInput.endsWith('h ago') ||
    strInput.endsWith('d ago')
  ) {
    return strInput;
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return strInput;
  }

  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 10) {
    return 'Just now';
  }
  if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }

  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) {
    return `${weeksAgo} ${weeksAgo === 1 ? 'week' : 'weeks'} ago`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
  }

  const yearsAgo = Math.floor(daysAgo / 365);
  return `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`;
}
