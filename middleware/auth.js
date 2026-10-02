const { auth } = require('../lib/auth');

module.exports = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                errorCode: 'UNAUTHORIZED'
            });
        }

        // Pass user object down the request
        req.user = session.user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token verification failed',
            errorCode: 'INVALID_TOKEN'
        });
    }
};
