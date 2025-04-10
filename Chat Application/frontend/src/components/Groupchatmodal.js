import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Input,
  useToast,
  FormControl,
  Tag,
  TagLabel,
  Box,
  TagCloseButton,
} from "@chakra-ui/react";
import { Chatstate } from "../Context/Context";
import axios from "axios";
import UserListItem from "./UserListItem";

function Groupchatmodal({ children }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  // writing some
  const [chatName, setchatName] = useState();
  const [search, setsearch] = useState();
  const [selectedUser, setselectedUser] = useState([]);
  const [searchResult, setsearchResult] = useState();
  const [Loading, setloading] = useState(false);
  const [createloading, setcreateloading] = useState(false);
  const { user, chats, setChats } = Chatstate();
  const toast = useToast();

  // search for the user
  const Searchuser = async () => {
    try {
      setloading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/users?search=${search}`,
        config
      );
      setsearchResult(data);
    } catch (err) {
      toast({
        title: "User Created Successfully",
        description: "Your Account has been creates",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    setTimeout(() => {
      setloading(false);
    }, 1000);
  };

  // selecting the Users
  const selectinguser = async (selcuser) => {
    setselectedUser([...selectedUser, selcuser]);
    console.log(selectedUser);
  };

  //creating the group
  const Creategroup = async () => {
    try {
      setcreateloading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      if (selectedUser.length < 2) {
        toast({
          title: "Less Members",
          description: "Need Atleast 2 user fro groupchat",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          setcreateloading(false);
        }, 2000);
        return;
      } else {
        // Remove duplicate IDs i.e users using Set
        const uniqueUserIdsSet = new Set(selectedUser.map(e => e._id));
            
        // Convert the Set back to an array
        const uniqueUserIds = Array.from(uniqueUserIdsSet);
        const name = chatName;

        const requestData = {
          users: JSON.stringify(uniqueUserIds), // Convert array to JSON string
          name,
        };

        const { data } = await axios.post(
          "http://localhost:5000/api/v1/chat/group",
          requestData,
          config
        );
        if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      }
    } catch (err) {
      toast({
        title: "Error 400",
        description: err.msg,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      console.log(err);
    }
    setTimeout(() => {
      setcreateloading(false);
    }, 2000);
    onClose();
    setselectedUser()
    setsearchResult()

  };

  return (
    <>
      <Button onClick={onOpen}>{children}</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" gap={3}>
            <FormControl>
              <Input
                placeholder="ChatName"
                fontFamily="Work sans"
                onChange={(e) => {
                  setchatName(e.target.value);
                }}
              />
            </FormControl>
            {selectedUser ? (
              <Box display="flex" gap={2}>
                {selectedUser.map((e) => (
                  <Tag
                    size="lg"
                    key={e._id}
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                  >
                    <TagLabel>{e.name}</TagLabel>{" "}
                    <TagCloseButton
                      onClick={() => {
                        setselectedUser(
                          selectedUser.filter((a) => a._id !== e._id)
                        );
                      }}
                    />
                  </Tag>
                ))}
              </Box>
            ) : (
              ""
            )}
            <FormControl>
              <Input
                placeholder="Search User"
                fontFamily="Work sans"
                onChange={(e) => {
                  setsearch(e.target.value);
                  Searchuser();
                }}
              />
            </FormControl>
            {Loading ? (
              <div>Loading</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((e) => (
                  <UserListItem
                    key={e._id}
                    user={e}
                    handleFunction={() => selectinguser(e)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={Creategroup}
              isLoading={createloading}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Groupchatmodal;
