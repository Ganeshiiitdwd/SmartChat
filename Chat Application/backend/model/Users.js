import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const UserSchema=mongoose.Schema({
    email:{type:String,required:true},
    name:{type:String,required:true},
    password:{type:String,required:true},
    language:{type:String},
    pic:{
        type:String,  default:"https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
    }
},{
    timestamps:true,
})

// now writing the fn to check the password match as first we need to dcrypt the password
//remember if you use th earrow fn instead of the regular it won't work as for arrow the this key word is not refering to the 
//instances of the user document that will be created hence to mae it perform like that we could use .bin(UserSchema.methods) after the end of the arrow fn
UserSchema.methods.matchpassword=async function (enpassword){
    return await bcrypt.compare(enpassword,this.password)
}

// encypting the password before saving in database
//as the function will be the middleware henc eusign thhe next
UserSchema.pre("save",async function(next){
   if(!this.isModified){
    next()
   }
   const salt=await bcrypt.genSalt(10)    //greater the number in the gensalt greater the enctpytion means more securely encrypted
   this.password=await bcrypt.hash(this.password,salt)

})



const UsersModel=mongoose.model('users', UserSchema)
export default UsersModel