import mongoose from "mongoose";
import Cryptr from "cryptr";
import { decrypt } from "dotenv";
const MessageModelSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  content: { type: String, trim: true },
  content2: { type: String, trim: true },
  msgimage:{type:String},
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' }
}, {
  timestamps: true,
});
const MessageModel = mongoose.model('messages', MessageModelSchema);
export default MessageModel;
