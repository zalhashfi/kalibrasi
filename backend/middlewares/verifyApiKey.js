//import prisma client
const prisma = require('../prisma/client');

/**
 * Middleware to verify API Key sent via 'x-api-key' header.
 * Looks up the key in the devices table and checks if the device is active.
 * If valid, attaches the device object to req.device for downstream use.
 */
const verifyApiKey = async (req, res, next) => {

    //get API key from header
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required. Send it via x-api-key header.',
        });
    }

    try {

        //find device by API key
        const device = await prisma.device.findUnique({
            where: {
                apiKey: apiKey,
            },
        });

        //device not found
        if (!device) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key.',
            });
        }

        //device is deactivated
        if (!device.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Device is deactivated. Contact administrator.',
            });
        }

        //attach device info to request object
        req.device = device;

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = verifyApiKey;
