import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function formatNotificationRelativeTime(createdAt, updatedAt) {
  const raw = updatedAt || createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
}
