/**
 * Get current time in WIB (UTC+7)
 * Returns a Date object adjusted to WIB timezone
 * for storage in PostgreSQL TIMESTAMP (timezone-naive)
 */
const getWIBTime = () => {
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
    return new Date(now.getTime() + wibOffset);
};

module.exports = { getWIBTime };
