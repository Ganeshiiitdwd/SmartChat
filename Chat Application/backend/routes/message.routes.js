import express from 'express'
import protect from '../middleware/authuser.js'
import {DeleteMessage, getAllmessage,imgcheck,msgImage,sendMessage, translatefn} from '../controller/Message.controller.js'
import {upload} from '../middleware/multer.middleware.js'
const routerm=express.Router()

routerm.route('/').post(protect,sendMessage)
routerm.route('/:chatIds').get(protect,getAllmessage)
routerm.route('/delete').post(protect,DeleteMessage)
routerm.route('/img').post(protect,upload.single('avatar'),msgImage)
routerm.route('/i').post(upload.single('avatar'),imgcheck)
routerm.route('/translate/:chatIds').get(protect,translatefn)
export default routerm