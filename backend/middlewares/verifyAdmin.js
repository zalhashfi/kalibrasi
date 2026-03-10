//import prisma client
const prisma = require('../prisma/client');

/**
 * Middleware to verify if the authenticated user is an admin.
 * Must be used AFTER verifyToken middleware (requires req.userId).
 */
const verifyAdmin = async (req, res, next) => {
    try {

        //find user by ID from token
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
            select: {
                id: true,
                isAdmin: true,
                isActive: true,
            },
        });

        //user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        //user is not active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated.',
            });
        }

        //user is not admin
        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.',
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = verifyAdmin;
