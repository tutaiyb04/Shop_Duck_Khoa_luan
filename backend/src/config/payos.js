const { PayOS } = require("@payos/node");

//  Bộ nhớ tạm (cached)
let cached = null;

function getPayOS() {
  // Kiểm tra Cache (Singleton Pattern)
  if (cached) {
    return cached;
  }

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

  // tạo ra 1 client PayOS
  cached = new PayOS({ clientId: id, apiKey: key, checksumKey: sum });
  return cached;
}

module.exports = { getPayOS };
