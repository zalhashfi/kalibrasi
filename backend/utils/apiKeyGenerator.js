const crypto = require('crypto');

/**
 * Generate a secure random API key
 * Returns a 64-character hex string
 */
const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateApiKey };
