import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser, imgmargin } from './Somelogic';
import { Chatstate } from '../Context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@chakra-ui/react';
import './img.css';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';

function Scrollablechat({ messages, fmsg, uploadb }) {
  const { user } = Chatstate();
  const toast = useToast();
  const [selectedmsg, setSelectedMsg] = useState([]);
  const [lastclick, setLastClick] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const msgDeleteHandler = async (msgid) => {
    try {
      const config = {
        headers: {
          "Content-type": 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const response = await axios.post("http://localhost:5000/api/v1/message/delete", { msgid }, config);
      console.log(response);
      fmsg();
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: 'message deletion unsuccessfully',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const clickHandler = (mid) => {
    const currTime = new Date().getTime()
    if (currTime - lastclick < 500) {
      setSelectedMsg([...selectedmsg, mid])
    }
    if (currTime - lastclick > 700) {
      if (selectedmsg.includes(mid)) {
        setSelectedMsg(selectedmsg.filter((e) => e !== mid))
      }
      console.log("message to remove from list")
      console.log(selectedmsg)
    }
    setLastClick(currTime)
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex", backgroundColor: selectedmsg.includes(m._id) ? 'gray' : 'black' }} key={m._id} onClick={() => clickHandler(m._id)}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}

            {m.content ? (
               <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? " #60ba60" : "#2a2438"
                    }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  cursor: 'pointer'
                }}
                
              >
                {m.content}
              </span>
            ) : (
                <div style={{ display: 'flex', justifyContent: m.sender?._id === user._id? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ maxWidth: '75%', textAlign: m.sender?._id === user._id? 'left' : 'right' }}>
                    <img
                      onClick={() => console.log(m)}
                      src={m.msgimage}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '10px',
                        marginTop: '10px',
                        cursor: 'pointer'
                      }}
                      alt="uploaded image"
                    />
                  </div>
                </div>
              )}
          </div>
        ))}
      {uploadb && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '3px' }}> <Spinner size="lg" /></div>}
      {selectedmsg.length > 0 ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FontAwesomeIcon size="2x" cursor="pointer" icon={faTrash} onClick={() => msgDeleteHandler(selectedmsg)} /></div> : <></>}
      <div ref={messagesEndRef} />
    </ScrollableFeed>
  );
}

export default Scrollablechat;
