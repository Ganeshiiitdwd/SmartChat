import React from 'react'
import { Chatstate } from "../Context/Context";
import { Box } from '@chakra-ui/react';
import Singlechat from '../components/Singlechat';
function Chatbox({fetchAgain,setfetch}) {
  const {selectedChat}=Chatstate()
  
  return (
   <Box
     display={{base:selectedChat?"flex":"none",md:'flex'}}
     alignItems="center"
     flexDir="column"
     p={3}
     bg="#2a2438"
     w={{base:'100%',md:'68%'}}
     borderRadius="lg"
   
   >
    <Singlechat fetchAgain={fetchAgain} setfetch={setfetch}/>
   </Box>
  )
}

export default Chatbox
