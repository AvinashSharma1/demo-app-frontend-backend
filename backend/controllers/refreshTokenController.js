const User = require('../model/user-model');
const jwt = require("jsonwebtoken");
const { JWT_REFERESH_TOKEN, JWT_ACCESS_TOKEN } = require("../Utils/Config");

const handleRefreshToken = async (req,res,next) => {
    const referer = req.headers.referer || req.headers.referrer;
    console.log('Request came from:', referer);
    const referer1 = req.get('referer');
    console.log('Request came from referer1:', referer);
    const url = req.originalUrl;
    console.log(`Request came from URL: ${url}`);
    const host = req.headers.host;
    console.log(`Request came from host: ${host}`);
    const cookies = req.cookies;
    /* const prevToken = cookies.split("=")[1];
    if(!prevToken){
        res.status(400).json({message:"No token found"});
    } */
    if(!cookies.jwt)
        return res.sendStatus(401);

    const refereshToken = cookies.jwt;
    console.log("refresh token = ", refereshToken);
    
    try {
        foundUser = await User.findOne({refreshToken:refereshToken});
        //console.log("found user ===", foundUser);
        if(!foundUser){
            return res.status(401).json({message:"User is not found!"});
        }
        else{
            jwt.verify(
                refereshToken,
                JWT_REFERESH_TOKEN,
                (err,decode) => {
                    console.log("err = ", err);
                    console.log("decode = ", decode);
                    if(err)
                        return res.status(403).json({message:err});
                    else {
                        if(foundUser._id !== decode.id)
                        {
                            const accessToken = jwt.sign(
                                {id:decode.id},
                                JWT_ACCESS_TOKEN,
                                {expiresIn:"30s"}            
                            );
                            return res.status(200).json({ accessToken });
                        }
                        else
                            return res.status(403).json({message:"Forbidden : user id not match"});
    
                    }    
                        
                }
                );
        }
    } catch (error) {
        return res.status(404).json({message:error.message});
    }

}
exports.handleRefreshToken = handleRefreshToken;