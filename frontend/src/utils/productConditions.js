export const PRODUCT_CONDITION_OPTIONS = [
  "Mới",
  "Như mới",
  "Tốt",
  "Trung bình",
  "Kém",
];

/** Chuẩn hoá NFC và map về giá trị enum đúng (khớp Select + backend). */
export function toCanonicalProductCondition(raw) {
  if (raw == null || String(raw).trim() === "") return "";
  const s = String(raw).trim().normalize("NFC").replace(/\uFEFF/g, "");
  const hit = PRODUCT_CONDITION_OPTIONS.find(
    (opt) => opt.normalize("NFC") === s,
  );
  return hit ?? s;
}
