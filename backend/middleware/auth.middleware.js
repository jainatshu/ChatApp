import jwt from 'jsonwebtoken'
import redisClient from '../services/redis.service.js';

export const authUser = async(req,res,next)=>{
    try {
        const token = req.cookies.token||req.headers.authorization.split(' ')[1];
        console.log(token);
        if(!token){
            return res.status(401).send({error: 'Unauthorized token'});
        }
        const isBlackListed = await redisClient.get(token);
        if(isBlackListed){
            res.cookies('token','');
            return res.status(401).send({error: "User loged out"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error in verifying token")
        res.status(401).json({errro: "Unauthorized user"})
    }
}