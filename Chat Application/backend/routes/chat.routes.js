import express from 'express'
import protect from '../middleware/authuser.js'
import {accessChat,addTogroup,createGroupChat,fetchChats,removeFromGroup,renameGroup} from '../controller/Chatcontroller.js'
const routerc=express.Router()

routerc.route('/').get(protect,fetchChats)
routerc.route('/').post(protect,accessChat)
routerc.route('/group').post(protect,createGroupChat)
routerc.route('/rename').put(protect,renameGroup)
routerc.route('/removeFgroup').put(protect,removeFromGroup)
routerc.route('/groupadd').put(protect,addTogroup);
export default  routerc