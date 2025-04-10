import express from 'express'
import protect from '../middleware/authuser.js'
import {createUser,authUser,userSearch} from '../controller/Users.controller.js'
const routeru=express.Router()

routeru.route('').post(createUser).get(protect,userSearch)
routeru.post('/login',authUser)

export default routeru;