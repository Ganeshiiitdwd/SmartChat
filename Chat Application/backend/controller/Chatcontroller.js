import ChatModel from "../model/Chatmodel.js";
import UsersModel from "../model/Users.js";
import {cryptr} from './Message.controller.js'
const fetchChats = async (req, res) => {
  try {
    const chats = await ChatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const allchats = await UsersModel.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email"
    });

    allchats.forEach((e) => {
      // checking if it works or not
      // console.log(e?.latestMessage?.content)
      if (e.latestMessage && e.latestMessage.content) {
        e.latestMessage.content = cryptr.decrypt(e.latestMessage.content);
      }
    });
    return res.status(200).json(allchats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const accessChat=async(req,res)=>{
    const { userId } = req.body;

  if (!userId) {
    console.log("Param not sent; hence can't access the data");
    return res.sendStatus(400);
  }

  try {
    var isChat = await ChatModel.find({
      isGroupchat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage.sender", "name pic email");
      
       isChat=await UsersModel.populate(isChat,{
        path:"latestMessage.sender",
        select:"name pic email"
       })

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupchat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await ChatModel.create(chatData);
      const fullChat = await ChatModel.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      //here we are populating that is referencing the users excluding the passwaord otherwise if it was just "password" it would have meant that from users include only passwords

      return res.status(200).json(fullChat);
    }
  } catch (err) {
    return res.status(400).json({msg:err.message});
  }
};


const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
      return res.status(400).json({ msg: "Kindly Fill all the fields" });
  }

  try {
      // Check if req.body.users is a valid JSON string
      let Users;
      try {
          Users = JSON.parse(req.body.users);
      } catch (error) {
          return res.status(400).json({ msg: "Invalid JSON format for users" });
      }

      if (!Array.isArray(Users)) {
          return res.status(400).json({ msg: "Users should be an array" });
      }

      if (Users.length < 2) {
          return res.status(400).json({ msg: "More than 2 members required" });
      }

      // Adding the logged in user
      Users.push(req.user);

      const groupData = {
          chatName: req.body.name,
          users: Users,
          isGroupchat: true,
          groupAdmin: req.user
      };

      const finalgroup = await ChatModel.create(groupData); //stuff that has been stored in the mongoDB 
      const fgroup = await ChatModel.findOne({ _id: finalgroup._id })  //stuff that willbe return to the forntend on the fuckin request just when it reach the users array it will act as refernece for the other documents for their details hence it won't be just userID like in the db it will be whole info of the user 
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

      return res.status(200).json(fgroup);
  } catch (err) {
      return res.status(500).json({ msg: err.message });
  }
};


const renameGroup=async(req,res)=>{
       const {groupId,newName}=req.body
       try{
       const updatedchat=   await ChatModel.findByIdAndUpdate({_id:groupId},{chatName:newName},{new:true}).populate("users","-password").populate("groupAdmin","-password")
          return res.status(200).json(updatedchat)
          
       }catch(err){
        return res.status(400).json({msg:err.message})
       }
}

const removeFromGroup=async(req,res)=>{
  const {userId,groupId}=req.body
  try{
    // new:true gives returns a modified value means removefromgroup would have updated value
        const removefromgroup= await ChatModel.findByIdAndUpdate(groupId,{$pull:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password")
           return res.status(200).json(removefromgroup)
       }catch(err){
   return res.status(400).json({msg:err.message})
  }
        
}

const addTogroup=async(req,res)=>{
   const {userId,groupId}=req.body
   try{
         const addTogroup= await ChatModel.findByIdAndUpdate(groupId,{$push:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password")
            return res.status(200).json(addTogroup)
        }catch(err){
    return res.status(400).json({msg:err.message})
   }

}

export {fetchChats,accessChat,createGroupChat,renameGroup,removeFromGroup,addTogroup}