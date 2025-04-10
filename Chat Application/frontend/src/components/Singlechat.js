import React, { useEffect, useRef, useState } from 'react'
import { Chatstate } from "../Context/Context";
import {Box,Button,FormControl,IconButton,Input,Text} from '@chakra-ui/react'
import {ArrowBackIcon} from '@chakra-ui/icons'
import { getSender,getSenderfull } from './Somelogic';
import ProfileModal from './ProfileModal';
import UpdateGroupModal from './UpdateGroupModal';
import axios from 'axios';
import './stylem.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import Scrollablechat from './Scrollablechat';
import { io } from "socket.io-client";
import animationData from '../Animation/lottie.json'
import Lottie from 'react-lottie'
import ImageModal from './ImageModal'
const ENDPOINT="http://localhost:5000/"
var sockets,selectedChatCompare;
function Singlechat({fetchAgain,setfetch}) {
  const [messages,setMessage]=useState([])
  const [newmessage,setNewMessage]=useState("")
  const [loading,setloading]=useState(false)
  const [typing,settyping]=useState(false)
  const [istyping,setistyping]=useState(false)
  const [socket,setsocket]=useState(false)
  const [refetch,setrefetch]=useState(false)
  const [upload,setuploda]=useState(false)
    const msgdeletemsghandler=()=>{
         setrefetch(!refetch)
         console.log(refetch)
    }
    const {selectedChat, setSelectedChat, user}=Chatstate()
    const fileInputRef=useRef(null)
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
//  for socket.io
  useEffect(()=>{
    sockets = io(ENDPOINT);
      sockets.emit("setup",user)
      sockets.on("connected",()=>{setsocket(true)})
      sockets.on("typing",()=>setistyping(true))
      sockets.on("stop typing",()=>setistyping(false))
  },[]) 
  
    const fethmessages=async()=>{
      setloading(true)
         try{
          const config={ 
            headers:{
              "Content-type":"application/json",
              Authorization:`Bearer ${user.token}`
            }
         }

         const {data}=await axios.get(`http://localhost:5000/api/v1/message/${selectedChat._id}`,config)
       
         setMessage(data)
         sockets.emit('join chat', selectedChat._id)
         setTimeout(() => {
               setloading(false)
         }, 1200);
         }catch(err){
          console.log(err)
         }
         setTimeout(() => {
          setloading(false)
    }, 1200);
    }

    // fetching chats when the selectedchat changes as for each chat new messages would be their hence react also very fuckin easy just think about the how app is processing how the interaction are going hence main is to make some data flow and functionality diagrams
    //for e.g in this case now their was question when to run this function so it with old ways i know their were some misconcept but now just think when u require it to run wehnever a person select other chats hence uset selectedchats as dependency

    useEffect(()=>{
      fethmessages()
      selectedChatCompare=selectedChat
    },[selectedChat,refetch])

    // for sending message
    useEffect(()=>{ 
      sockets.on("message recieved",(newmessage)=>{
        if(!selectedChatCompare||selectedChatCompare._id!==newmessage.chat._id){
          //give notification
        }else{
          setMessage([...messages,newmessage])
        }
      })
    })
    const sendMessage=async()=>{
       sockets.emit("stop typing", selectedChat._id)
             try{
                   const config={
                      headers:{
                        "Content-type":"application/json",
                        Authorization:`Bearer ${user.token}`
                      }
                   }
                   setNewMessage("")
                const {data}=await axios.post("http://localhost:5000/api/v1/message",{content:newmessage,chatId:selectedChat._id},config)
                sockets.emit("new message",data)
                setMessage([...messages,data])
               
             } catch(err){
              console.log(err.messages)
             }
    }

    const sendDoc=async(docs)=>{
        try {
          setuploda(true)
          const config={
            headers:{
              "Content-type":"multipart/form-data",
              Authorization:`Bearer ${user.token}`
            }
         }
          console.log("entered sendoc")
         const {data}=await axios.post("http://localhost:5000/api/v1/message/img",docs,config)
         sockets.emit("new message",data) 
         setMessage([...messages,data])
         setuploda(false)
        } catch (error) {
          setuploda(false)
           console.log(error)
        }
    }

    const typinghandler=async(e)=>{
           setNewMessage(e.target.value)
           if(!socket) return;
           if(!typing){
            settyping(true)
            sockets.emit('typing',selectedChat._id)
           }
           let lastTypingTime = new Date().getTime();
           var timerLength = 4000;
           setTimeout(() => {
             var timeNow=new Date().getTime()
             var timediff=timeNow-lastTypingTime
             if(timediff>=timerLength&&typing){
              sockets.emit("stop typing", selectedChat._id)
              settyping(false)
             }
           }, timerLength);
          
    }
  return (
    <>
    {selectedChat?(<>
       <Text
         fontSize={{base:"28px",md:"30px"}}
         pb={3}
         px={2}
         w="100%"
         fontFamily="Work sans"
         display="flex"
         justifyContent={{base:"space-between"}}
         alignItems="center"
       >
        <IconButton display={{base:"flex",md:"none"}} icon={<ArrowBackIcon/>} onClick={()=>setSelectedChat("")}/>
        {!selectedChat.isGroupchat ? (
  <Box display="flex" justifyContent="space-between" alignItems="center" w="100%">
  <Text>{getSender(user, selectedChat.users)}</Text>
  
  <Box display="flex" alignItems="center" gap={2}>
  <Button
  size="sm"
  colorScheme="teal"
  onClick={async () => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/v1/message/translate/${selectedChat._id}`, config);
      setMessage(data);  // Overwrite messages with translated ones
    } catch (error) {
      console.error("Translation failed:", error);
    }
  }}
>
  Translate
</Button>

    <ProfileModal user={getSenderfull(user, selectedChat.users)} />
  </Box>
</Box>

) : (
  <>
    {selectedChat.chatName.toUpperCase()}
    <UpdateGroupModal fetchAgain={fetchAgain} setfetch={setfetch} fetchmessage={fethmessages} />
  </>
)}

       </Text>
       <Box
         display="flex"
         flexDir="column"
         justifyContent="flex-end"  
         p={3}
         bg="black"
         w="100%"
         h="100%"
         borderRadius="lg"
         overflowY="hidden"
       >
        {loading?<>Loading...!</>:(<div className='message'>
          <Scrollablechat messages={messages} fmsg={msgdeletemsghandler} uploadb={upload} />
        </div>)}
        {/* to send the message on clicking enter hence using this onkeydown   justifyContent="flex-end"  responsible to place the input field at the bottom*/}
        {istyping?<div >
                  <Lottie
                    options={defaultOptions}
                    height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>:<></>}
        <FormControl display="flex" onKeyDown={(e) => { if (e.key === 'Enter') {  e.preventDefault();sendMessage(); } }} border="none" isRequired >
       
          <Input flex="1" placeholder="Enter the message" _placeholder={{color:'white'}} _hover={{}} autoComplete='off'  focusBorderColor="none"  color="white" onChange={typinghandler} backgroundColor="#4c4a4f" border="none" value={newmessage}/>
             <ImageModal docfn={sendDoc} ><Button>Upload</Button></ImageModal>
        </FormControl>
        
       </Box>
    </>):(<>
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on the user to start the chats
        </Text>
      </Box>
    </>)}
    </>
  )
}

export default Singlechat
