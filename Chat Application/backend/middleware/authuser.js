import jwt from 'jsonwebtoken'
import UsersModel from "../model/Users.js";

const protect=async(req,res,next)=>{
  let token;
  if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
    try{
       token=req.headers.authorization.split(" ")[1]
       const decoded=jwt.verify(token,process.env.jwt_scecret)
       req.user=await UsersModel.findById(decoded.id).select("-password")
       next();
    }catch(err){
      return res.status(400).json({err})
    }
  }
  if(!token){
    return res.status(400).json({msg:"No token found"})
  }
}

export default protect;