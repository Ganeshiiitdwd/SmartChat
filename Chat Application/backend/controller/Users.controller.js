import UsersModel from "../model/Users.js";
import generatetoken from "../db/generatetoken.js";
const createUser=async(req,res)=>{
     try{
      const {email,name,password,pic,language} =req.body
      const UserExits=await UsersModel.findOne({email})
      if(UserExits){
       return res.status(200).json(UserExits)
      }
    //   just adding one extra of the jwt
      const  NewUser=await UsersModel.create({
            email,name,password,pic,language
        })
                   
    //   return res.status(200).json(NewUser) instead to avoid the complecation of adding the jwt to exisitng one we will send each stuff separately
    return res.status(201).json({
        _id:NewUser._id,
        name:NewUser.name,
        email:NewUser.email,
        pic:NewUser.pic,
        language:NewUser.language,
        token:generatetoken(NewUser._id)
    })
     }catch(err){
        res.status(500).json({msg:err.message})
     }
}


// authehntication of the user that is the fuckin login part

const authUser=async(req,res)=>{
    try{
        const {email,password}=req.body
        const User=await UsersModel.findOne({email})
        if(!User){
          return res.status(200).json({msg:'Invalid username or password'})
        }
        else if(User&& (await User.matchpassword(password))){
         res.status(200).json({
             _id:User._id,
             name:User.name,
            email:User.email,
             pic:User.pic,
             language:User.language,
             token:generatetoken(User._id)
            })
        }
        else if(await User.matchpassword(password)===false){
            return res.status(500).json({msg:'Incorrect Password'})
        }
    }catch(err){
      return  res.status(500).json({msg:err.message})
    }
       
}

// for searching the users

const userSearch=async(req,res)=>{
    try{
        const keyword=req.query.search?{
           $or:[{name:{$regex:req.query.search,$options:'i'} },
           {email:{$regex:req.query.search,$options:'i'} }
          ]
        }:{}
         const Allusers=await UsersModel.find(keyword).find({_id:{$ne:req.user._id}})
         res.status(200).json(Allusers)
    }catch(err){
      res.status(200).json({msg:"Error Occured"})
    } 
}

export  {createUser,authUser,userSearch}