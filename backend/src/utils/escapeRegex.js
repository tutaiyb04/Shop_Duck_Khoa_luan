function escapeRegexForSearch(str) {
  if (str == null || str === "") return "";
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { escapeRegexForSearch };
