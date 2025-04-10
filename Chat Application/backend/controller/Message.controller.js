import ChatModel from "../model/Chatmodel.js"
import MessageModel from "../model/Messages.js"
import UsersModel from "../model/Users.js"
import {uploadOncloudinary} from '../utils/cloudinary.js'
import * as dotenv from 'dotenv'
import axios from 'axios'
import {v2 as cloudinary} from 'cloudinary'
import Cryptr from "cryptr"
dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
const cryptr=new Cryptr('myTotallySecretKey', { encoding: 'base64', pbkdf2Iterations: 10000, saltLength: 10 })
// const sendMessage = async (req, res) => {
//   const { content, chatId } = req.body;
//   if (!content || !chatId) {
//     return res.status(400).json({ msg: "Must have content and chatID" });
//   }

//   try {
//     // Default: original message stays the same
//     let originalContent = content;
//     let translatedContent = null;

//     // Translate original message to English
//     try {
//       const response = await axios.post("http://10.0.12.102:8000/translate", {
//         sentence: originalContent,
//         src_lang: "hin", // assuming sender writes in Hindi during testing
//         tgt_lang: "eng"
//       });

//       translatedContent = response.data.translated_text;
//     } catch (err) {
//       console.error("Translation to English failed:", err.message);
//     }

//     // Encrypt both versions (if translation exists)
//     const encryptedOriginal = cryptr.encrypt(originalContent);
//     const encryptedTranslated = translatedContent ? cryptr.encrypt(translatedContent) : null;

//     // Save both contents into the DB
//     const newMessage = {
//       content: encryptedOriginal,
//       content2: encryptedTranslated,
//       chat: chatId,
//       sender: req.user._id
//     };

//     const message = await MessageModel.create(newMessage);

//     // Populate message fields
//     let updatedMessage = await MessageModel.findOne({ _id: message._id })
//       .populate("sender", "name pic email language")
//       .populate("chat");

//     updatedMessage = await UsersModel.populate(updatedMessage, {
//       path: "chat.users",
//       select: "name pic email language"
//     });

//     await ChatModel.findByIdAndUpdate(chatId, {
//       latestMessage: message,
//     });

//     // Show the original message (Hindi) to sender
//     const finalMessage = updatedMessage.toObject();
//     finalMessage.content = originalContent;
//     delete finalMessage.content2;

//     return res.status(200).json(finalMessage);
//   } catch (err) {
//     return res.status(400).json({ msg: err.message });
//   }
// };
const sendMessage=async(req, res)=>{
  const {content,chatId}=req.body
  if(!content||!chatId){
     return res.status(400).json({msg:"Must have content and chatID"})
  }
  try{
     // encrypting the messages

       const msgencrypt=cryptr.encrypt(content)
     var newMessage={
         content: msgencrypt,
         chat:chatId,
         sender:req.user._id
     }
     const message=await MessageModel.create(newMessage)
     // now updating the message
     // message =await MessageModel.populate("sender","name pic").populate("chat")
     // message=await UsersModel.populate(message,{
     //     path:"chat.users",
     //     select:"name pic email"
     // })
     var updatedmessage= await MessageModel.findOne({_id:message._id}).populate("sender","name pic email").populate("chat")
        updatedmessage= await UsersModel.populate(updatedmessage,{
              path:"chat.users",
              select:"name pic email"
        })
  await ChatModel.findByIdAndUpdate(req.body.chatId,{
     latestMessage:message,
  })
  console.log(updatedmessage.content)
    updatedmessage.content=cryptr.decrypt(updatedmessage.content)
    console.log(updatedmessage.content)
  return res.status(200).json(updatedmessage)
    
  }catch(err){
     res.status(400).json({msg:err.message})
  }
} 



// const getAllmessage = async (req, res) => {
//   try {
//     const allMessages = await MessageModel.find({ chat: req.params.chatIds })
//       .populate("sender", "name pic email language")
//       .populate("chat");

//     const finalMessages = allMessages.map((message) => {
//       const decryptedOriginal = cryptr.decrypt(message.content);
//       const decryptedTranslated = message.content2 ? cryptr.decrypt(message.content2) : null;

//       const msgObj = message.toObject();

//       // Show content based on who's requesting
//       if (message.sender._id.toString() === req.user._id.toString()) {
//         // Sender sees original
//         msgObj.content = decryptedOriginal;
//       } else {
//         // Receiver sees translated if exists, else original
//         msgObj.content = decryptedTranslated || decryptedOriginal;
//       }

//       // Clean up
//       delete msgObj.content2;
//       return msgObj;
//     });

//     return res.status(200).json(finalMessages);
//   } catch (err) {
//     return res.status(400).json({ msg: err.message });
//   }
// };
const getAllmessage=async(req,res)=>{
  try{
       const allchat=await MessageModel.find({chat:req.params.chatIds}).populate("sender","-password").populate("chat")
    //    remember this .chatIds is the name on the  (:/chatIds) on the corresponding routes for this function
    allchat.forEach((message) => {
     // Decrypt the content field
     if(message.content){
        message.content = cryptr.decrypt(message.content);
     }
     
 });
    return res.status(200).json(allchat)
  }catch(err){
    return res.status(400).json({msg:err.message})
  }

}

const translatefn=async(req, res)=>{
   try {
      const userId = req.user._id.toString(); // Logged-in user
  
      let allchat = await MessageModel.find({ chat: req.params.chatIds })
        .populate("sender", "-password")
        .populate("chat");
  
      const updatedMessages = await Promise.all(
        allchat.map(async (message) => {
          if (message.content) {
            // Decrypt the content
            const decrypted = cryptr.decrypt(message.content);
  
            // If the sender is NOT the current user (i.e., receiver viewing the sender's message)
            if (message.sender._id.toString() !== userId) {
              try {
                const response = await axios.post("http://10.0.12.102:8000/translate", {
                  sentence: decrypted,
                  src_lang: "hin",
                  tgt_lang: "tam",
                });
  
                message.content = response.data.translated_text || decrypted;
              } catch (err) {
                console.error("Translation error:", err.message);
                message.content = decrypted; // Fallback to original decrypted content
              }
            } else {
              // Sender's own message, no translation
              message.content = decrypted;
            }
          }
  
          return message;
        })
      );
  
      return res.status(200).json(updatedMessages);
    } catch (err) {
      return res.status(400).json({ msg: err.message });
    }
}

const DeleteMessage=async(req,res)=>{
     try {
           const {msgid}=req.body
           if(!msgid){
              return res.status(400).json({msg:'msgId is required'})
           }
         for (let index = 0; index <msgid.length; index++) {
            const id= msgid[index]
            await MessageModel.findByIdAndDelete(id)
            
         }
           return res.status(200).json({msg:'Message Deleted Successfully'})
     } catch (error) {
          console.log(error.message)
     }
}


const msgImage=async(req,res)=>{
   try {
      const imgpath= req.file?.path
      const {chat,avatar}=req.body
      const sender=req.user?._id
        
      if(!imgpath){
         console.log("image not saved in multer locally something was wrong their")
      }
      
      const img= await uploadOncloudinary(imgpath)
      
      if(!img){
         console.log("something went wrong while uplaoding the image")
      }
      const msg= await MessageModel.create({msgimage:img.url, chat,sender})
      var updatedmessage= await MessageModel.findOne({_id:msg._id}).populate("sender","name pic email").populate("chat")
      updatedmessage= await UsersModel.populate(updatedmessage,{
            path:"chat.users",
            select:"name pic email"
      })

      return res.status(200).json(updatedmessage)
} catch (error) {
console.log(error.message)
}
}

const msgImage2=async(req,res)=>{
   try {
            const imgpath= req.file?.path
            const {chat,avatar}=req.body
            const sender=req.user?._id
               console.log(avatar)
               console.log(chat)
            if(!imgpath){
               console.log("image not saved in multer locally something was wrong their")
            }
            console.log(imgpath)
            const img= await uploadOncloudinary(imgpath)
            
            if(!img){
               console.log("something went wrong while uplaoding the image")
            }
            const msg= await MessageModel.create({msgimage:img.url, chat,sender})
            var updatedmessage= await MessageModel.findOne({_id:msg._id}).populate("sender","name pic email").populate("chat")
            updatedmessage= await UsersModel.populate(updatedmessage,{
                  path:"chat.users",
                  select:"name pic email"
            })

            return res.status(200).json(updatedmessage)
   } catch (error) {
      console.log(error.message)
   }
}
const imgcheck=async(req,res)=>{
   console.log("Image saved Successfully")
}
export  {sendMessage,getAllmessage, DeleteMessage,msgImage,imgcheck,cryptr,translatefn}