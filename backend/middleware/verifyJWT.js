const jwt = require('jsonwebtoken');
const { JWT_ACCESS_TOKEN } = require('../Utils/Config');

const verifyJWTToken = (req,res,next) => {
    const authheader = req.headers['authorization'];
    if(!authheader)
        return res.sendStatus(401);

    const token = authheader.split(" ")[1];
    console.log("auth header....",authheader);
    
    if(!token){
        return res.status(400).json({message:"No token found"});
    }
     else {
        jwt.verify(
            String(token),
            JWT_ACCESS_TOKEN,
            (err,decode)=>{
                if(err){
                    return res.status(400).json({message:"Invalid token"});
                }
                console.log(decode.id);
                req.id= decode.id;
                next();
        });
     }  
    
}
exports.verifyJWTToken = verifyJWTToken;