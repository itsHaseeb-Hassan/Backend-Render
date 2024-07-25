import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader in midelware", authHeader)

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log("token in authmiddelware",token)

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

export { authMiddleware };
