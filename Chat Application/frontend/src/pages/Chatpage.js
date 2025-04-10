import React, { useEffect, useState } from 'react'
import {Box} from '@chakra-ui/react'
import { Chatstate } from '../Context/Context'
import axios from 'axios'
import Sidedrawer from '../Chats/Sidedrawer'
import Mychats from '../Chats/Mychats'
import Chatbox from '../Chats/Chatbox'
function Chatpage() {
  const {user}=Chatstate()
  const [fetchChatAgain,setfetchchat]=useState(false)
  
  return (
    <div style={{width:"100%"}}>
    { user&&<Sidedrawer/>}
     <Box display="flex" justifyContent="space-between" w='100%' h='91vh' p='10px'>
       {user&&<Mychats fetchAgain={fetchChatAgain}/>}
      {user&& <Chatbox fetchAgain={fetchChatAgain} setfetch={setfetchchat}/>}
     </Box>
    </div>
  )
}

export default Chatpage
