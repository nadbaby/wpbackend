const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
    jwksUri: process.env.NEON_AUTH_JWKS_URL
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err) {
            callback(err, null);
            return;
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied',
            errorCode: 'NO_TOKEN'
        });
    }

    const tokenPart = token.split(' ')[1] || token;

    jwt.verify(tokenPart, getKey, { algorithms: ['ES256', 'RS256'] }, (err, decoded) => {
        if (err) {
            // fallback to the old JWT secret for admin manual creation if needed
            try {
                const oldDecoded = jwt.verify(tokenPart, process.env.JWT_SECRET);
                req.user = oldDecoded.userId || oldDecoded.id || oldDecoded.email;
                return next();
            } catch (fallbackErr) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid',
                    errorCode: 'INVALID_TOKEN'
                });
            }
        }

        // Neon Auth token contains the ID in `sub` and email possibly.
        req.user = decoded;
        next();
    });
};
