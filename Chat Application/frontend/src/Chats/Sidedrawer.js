import { Box, Button, Tooltip,Text, Menu, MenuButton, Avatar, MenuItem, MenuList, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, useDisclosure, DrawerBody, Input, useToast } from '@chakra-ui/react'
import {BellIcon, ChevronDownIcon} from '@chakra-ui/icons'
import React, { useState } from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Chatstate } from '../Context/Context'
import ProfileModal from '../components/ProfileModal'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ChatLoading from '../components/ChatLoading'
import UserListItem from '../components/UserListItem'
function Sidedrawer() {
  const btnref=React.useRef()
  const [result,setresult]=useState([])
  const [search,setsearch]=useState()
  const [loading,setloading]=useState()
  const [chatloading,setchatloading]=useState()
  const {isOpen, onOpen,onClose}=useDisclosure()
  const navigate=useNavigate()
  const toast=useToast()
  // logout handler
  const LogOut=()=>{
    localStorage.removeItem('userInfo')
      setUser(null)
      setSelectedChat(null)
      setChats([])
    navigate('/')
  }

  const {user,setUser, selectedChat,chats, setChats,setSelectedChat}=Chatstate()
    //  console.log(user)
  // searching for user backend request
  const SearchUser=async()=>{
        try{
          setloading(true)
          const config={
            headers:{ "Content-type":"application/json",
            "Authorization": `Bearer ${user.token}`
          }
            
          }
          const {data}=await axios.get(`http://localhost:5000/api/v1/users?search=${search}`,config)
           if(data){
            setresult(data)
            
           }
        }catch(err){
          console.log(err)
        }
        setTimeout(() => {
          setloading(false)
        }, 1500);
  }

  const accessChata=async(userId)=>{
            try{
            setchatloading(true)
              const config={
                headers:{ "Content-type":"application/json",
                "Authorization": `Bearer ${user.token}`
              }
                 
              }
              
              const {data}=await axios.post(`http://localhost:5000/api/v1/chat/`,{userId},config)
              if(!chats.find((c)=>c._id===data._id))setChats([data,...chats])
              setSelectedChat(data)
              onClose()
            }catch(err){
              toast({
                title: 'User Created Successfully',
                description: "Your Account has been creates",
                status: 'success',
                duration: 5000,
                isClosable: true,
              })
            }
            setTimeout(() => {
              setchatloading(false)
            }, 1500);
  }
  
  return (
    <>
    <Box
     display="flex"
     justifyContent="space-between"
     alignItems="center"
     bg="#2a2438"
     w="100%"
     p="5px 10px 5px 10px"
    borderRadius='lg'
    >
      <Tooltip label="Search the Users" hasArrow placement='bottom-end'>
        <Button variant="ghost" ref={btnref} colorScheme='white' onClick={onOpen}><FontAwesomeIcon color='white' icon={faMagnifyingGlass} /><Text d={{base:'none',md:'flex'}} px="4" color="white">Search User</Text></Button>
      </Tooltip>
      <Text fontSize="2xl" fontFamily="Work sans">SmartChat</Text>
      <div style={{display:'flex'}}>
        <Menu>
          <MenuButton>
          <BellIcon w={7} h={7}/>
          </MenuButton>

        </Menu>
        <Menu  focusBorderColor="none">
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
            <Avatar size='sm' cursor="pointer" name={user.name} src={user.pic}/>
          </MenuButton>
          <MenuList bg="#2a2438" >
          <ProfileModal user={user}>
                <MenuItem bg="#2a2438">My Profile</MenuItem>{" "}
              </ProfileModal>
         
          <MenuDivider/>
          <MenuItem onClick={LogOut} bg="#2a2438">LogOut</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>
    <Drawer placement='left' onClose={onClose} isOpen={isOpen}  finalFocusRef={btnref}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
        <DrawerBody>
        <Box display="flex" pb={2}>
          <Input 
          placeholder='search by name or email'
          mr={2}
          value={search}
          onChange={(e)=>{setsearch(e.target.value)}}
          />
          <Button onClick={SearchUser}>Go</Button>
        </Box>
{loading?<ChatLoading/>:(result?.map((e)=>(   
       <UserListItem key={e._id} user={e} handleFunction={()=>accessChata(e._id)}/>
)))}
      </DrawerBody>
    
      </DrawerContent>
      
    </Drawer>
    
    </>
  )
}

export default Sidedrawer
