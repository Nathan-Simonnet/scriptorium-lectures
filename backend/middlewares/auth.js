import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        if (!decodedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        console.log("Error in the process of verifying token");
        res.status(401).json({ message: "Error in the process of verifying token" });
    }
};

export default auth;