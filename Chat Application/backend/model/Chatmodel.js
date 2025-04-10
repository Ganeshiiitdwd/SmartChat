import mongoose from 'mongoose'

const CharmodelSchema=mongoose.Schema({
    chatName:{type:String,required:true},
    isGroupchat:{type:Boolean,default:false},
    users:[{type:mongoose.Schema.Types.ObjectId, ref:'users'}],
    latestMessage:{type:mongoose.Schema.Types.ObjectId,ref:'messages'},
    groupAdmin:{type:mongoose.Schema.Types.ObjectId,ref:'users'}
},{
    timestamps:true,
})

const ChatModel=mongoose.model('chat',CharmodelSchema)
export default ChatModel;