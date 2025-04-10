import React from 'react'
import {Container,Box,Text, Tabs, TabList, TabPanels, Tab, TabPanel} from '@chakra-ui/react'
import SignUp from './SignUp'
import Login from './Login'
function Homepage() {
  return (
    <Container maxW="xl" centerContent >
          <Box backgroundColor=" #352f44" borderColor="#352f44" p={3}  w='100%' m="40px 0 15px 0" borderRadius='lg' borderWidth='1px' display="flex" justifyContent="center">
            <Text color="white" fontSize="4xl" fontFamily="Work sans">SmartChat</Text>
           
          </Box>
       <Box backgroundColor="#352f44"  borderColor="#352f44"  w='100%' p={3} borderRadius='lg' borderWidth='1px' color="white">
       <Tabs  variant='soft-rounded' >
           <TabList mb='1em'>
             <Tab w='50%' color="white">Login</Tab>
             <Tab w='50%' color="white">Sign Up</Tab>
         </TabList>
         <TabPanels>
           <TabPanel >
               <Login/>
            </TabPanel>
            <TabPanel>
              <SignUp/>
          </TabPanel>
       </TabPanels>
      </Tabs>
       </Box>
    </Container>
  )
}

export default Homepage
