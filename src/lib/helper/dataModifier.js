export function modifyDate(current) {
  const date = new Date() - new Date(current);
  const days = Math.floor(date / (1000 * 60 * 60 * 24));
  const hours = Math.floor(date / (1000 * 60 * 60));
  const minutes = Math.floor(date / (1000 * 60));
  const seconds = Math.floor(date / 1000);
  const month = new Date(current)?.toLocaleString("default", {
    month: "short",
    day: "numeric",
  });

  return days > 1
    ? `${month}`
    : days === 1
    ? "Yesterday"
    : hours >= 1
    ? `${hours}h`
    : minutes >= 1
    ? `${minutes}m`
    : `${seconds}s`;
}
