const { PayOS } = require("@payos/node");

let cached = null;

/**
 * Trả về client PayOS (singleton). Đọc PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY
 * từ môi trường khi khởi tạo lần đầu — tránh ném lỗi lúc `require` module khi chưa cấu hình.
 */
function getPayOS() {
  if (cached) return cached;
  const id = process.env.PAYOS_CLIENT_ID?.trim();
  const key = process.env.PAYOS_API_KEY?.trim();
  const sum = process.env.PAYOS_CHECKSUM_KEY?.trim();
  if (!id || !key || !sum) {
    const err = new Error(
      "Thiếu cấu hình PayOS: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY",
    );
    err.code = "PAYOS_NOT_CONFIGURED";
    throw err;
  }
  cached = new PayOS({ clientId: id, apiKey: key, checksumKey: sum });
  return cached;
}

module.exports = { getPayOS };
