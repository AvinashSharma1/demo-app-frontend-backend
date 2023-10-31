const User = require('../model/user-model');
const { use } = require('../routes/user-routes');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_ACCESS_TOKEN, JWT_REFERESH_TOKEN } = require('../Utils/Config');

const signup = async (req,res,next) => {

    const {name,email,password} = req.body;
    let existUser=false;

    try {
        existUser = await User.findOne({email:email});
    } catch (error) {
        console.log(err);
    }
    if(existUser)
    {
        return res.status(400).json({message:"User already exists"});
    }
    const hashPassword = bycrypt.hashSync(password);
    const user = new User({
        name:name,
        email:email,
        password:hashPassword,
    });

   

    try{
        await user.save();
    } catch (err){
        console.log(err);
    }
    return res.status(201).json({message:user});
}

const login = async (req,res,next) => {
    const {email,password} = req.body;
    let existUser = false;
    try {
        existUser = await User.findOne({email:email});
    } catch (error) {
        return new Error(error);
    }
    if(!existUser){
        return res.status(400).json({message:"User is not found! Signup please"});
    }
    const isPasswordMatch = await bycrypt.compare(password,existUser.password);
    if(isPasswordMatch){
        
        const accessToken = jwt.sign({id:existUser._id},JWT_ACCESS_TOKEN,{
            expiresIn:"30s"
        });
        console.log(JWT_REFERESH_TOKEN);
        const refereshToken = jwt.sign({id:existUser._id},JWT_REFERESH_TOKEN,{
            expiresIn:"1d"
        });

        // Refresh token save in db
            existUser.refreshToken = refereshToken;
            await existUser.save();
        
       /*  if(req.cookies[`${existUser._id}`])
        {
            req.cookies[`${existUser._id}`] = "";
        } */

        res.cookie("jwt",refereshToken,{
            path:"/",
            maxAge:24*60*60*1000,
            //expires:new Date(Date.now() + daysToMilliseconds(1)),
            httpOnly:true,
            sameSite:"none",
            secure:true,
        });
        return res.status(200).json({
            message:"Successfully Logged In",
            user:existUser,
            accessToken:accessToken
        });
        
    }
    else {
        return res.status(401).json({message:"Invalid password!"});
    }
}


const getUser = async(req,res,next) => {
    const userId = req.id;
    let user;
    try {
        user = await User.findById(userId, "-password");
    } catch (err) {
        return new Error(err)
    }
    if(!user){
        return res.status(400).json({message:"User is not found!"});
    }
    console.log(user);
    return res.status(200).json({ user });
}
const refreshToken = (req,res,next) => {

    const cookies = req.headers.cookie;
    if(!cookies){
        res.status(400).json({message:"Cookie not found"});
    }

    const prevToken = cookies.split("=")[1];
    if(!prevToken){
        res.status(400).json({message:"No token found"});
    }

    jwt.verify(String(prevToken),JWT_SECRECT_KEY,(err,user)=>{
        if(err){
            return req.status(403).json({message:"Authentication failed"});
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";
        const token = jwt.sign({id:user.id},JWT_SECRECT_KEY,{
            expiresIn:"24h"
        });
        res.cookie(String(user.id),token,{
            path:"/",
            //maxAge:30000,
            expires:new Date(Date.now() + daysToMilliseconds(1)),
            httpOnly:true,
            sameSite:"lax"
        });
        req.id = user.id;
        next();

    });

} 

const logout = (req,res,next) => {

    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if(!prevToken){
        res.status(400).json({message:"No token found"});
    }

    jwt.verify(String(prevToken),JWT_SECRECT_KEY,(err,user)=>{
        if(err){
            return req.status(403).json({message:"Authentication failed"});
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";
       return res.status(200).json({message:"Succesfully Loogout!"});

    });
}
const daysToMilliseconds =  (days) => {
    return days * 24 * 60 * 60 * 1000;
}
exports.signup = signup;
exports.login = login;
//exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;
exports.logout = logout;