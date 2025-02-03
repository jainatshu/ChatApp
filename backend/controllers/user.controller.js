import userModel from '../models/user.model.js'
import * as userServices from '../services/user.service.js'
import { validationResult } from 'express-validator'
import redisClient from '../services/redis.service.js'
export const createUserController = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userServices.createUser(req.body);
        const token = await user.generateJWT();
        delete user._doc.password
        res.status(201).json({user, token});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const loginController = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try{
        const {email,password} = req.body;
        const user = await userModel.findOne({email}).select("+password")
        if(!user){
            return res.status(401).json({
                errors: "Invalid Credentials"
            })
        }
        const isMatch = await user.isValidPassword(password)
        if(!isMatch){
            return res.status(401).json({
                 errors: "Invalid Credentials"
            })
        }
        const token = await user.generateJWT();
        delete user._doc.password
        res.status(200).json({user,token})


    }catch(err){
        res.status(400).send(err.message)
    }
    

}

export const profileController = async(req,res)=>{
    try {
        res.status(200).json({
            user: req.user
        })
    } catch (error) {
        console.log("Error in fetching data")
        res.status(404).json({
            errors: error.message
            
        })
    }
}

export const logoutController = async (req,res)=>{
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24)
        res.status(200).json({
            message: 'Logout Succefully'
        })
    } catch (error) {
        console.log('problem in setting token')
        res.status(404).json({
            errors: error.message
            
        })
    }
}

export const getAllUserController = async(req,res)=>{
    try {
        const loggedInUser = await userModel.findOne({
            email:req.user.email
        })
        const allUsers = await userServices.getAllUser({loggedInUser})
        if(!allUsers){
            
        }
        return res.status(200).json({users:allUsers})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors:error.message})
    }
}

export const getCuurUser = async(req,res)=>{
    try {
        const loggedInUser = await userModel.findOne({
            email:req.user.email
        })
        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: loggedInUser });
    } catch (error) {
        console.log(error);
        res.status(400).json({error});
    }
}