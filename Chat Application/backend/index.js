import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http'; // Import the http module
import cors from 'cors';
import { Server } from 'socket.io';
import routerc from './routes/chat.routes.js';
import routerm from './routes/message.routes.js';
import routeru from './routes/user.routes.js';
import connectDB from './db/connect.js';

dotenv.config();
const app = express();
const server = http.createServer(app); // Create an http server using the express app

// this app.use(cors()) gives the access of the servers to the others
app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended:true}))

// for the users
app.use('/api/v1/users', routeru);
app.use('/api/v1/message', routerm);
app.use('/api/v1/chat', routerc);

app.get('/api/chats', (req, res) => {
  res.send({ msg: 'hello brother' });
});
// connecting this fuckin shit 
const io = new Server(server,{
    pingTimeout:60000,   //to cut the connection after this 60sec of not doing anything to save the bandwidth
    cors: {
        origin: "http://localhost:3000"
      }
}); // Pass the http server instance to socket.io
 
io.on('connection', (socket) => {
  console.log('a user connected');
  //making specific socket for the users
  socket.on('setup',(userData)=>{  //remeber the 'setup' and "connected" are th events and on triggering the events we will perform some actions like join 
      socket.join(userData._id);  
      socket.emit("connected")
  })
  //creating the rooms i.e a socket for user and its friend
  socket.on('join chat',(room)=>{
    socket.join(room)
    console.log("Room:"+room)
  })

  // socket for the typing
  socket.on('typing',(room)=>socket.in(room).emit('typing'))
  socket.on('stop typing',(room)=>socket.in(room).emit('stop typing'))
  
  socket.on("new message",(newmessageReceive)=>{  
    var chat=newmessageReceive.chat
    if(!chat.users) return console.log("chat.users not defined")
    chat.users.forEach((user)=>{
      if(user._id==newmessageReceive._id) return;
      socket.in(user._id).emit("message recieved", newmessageReceive)
    })
  })
});

const start = async () => {
  try {
    await connectDB(process.env.DB_CONNECT_URI);
    server.listen(5000, () => {
      console.log('Server is Live');
    });
  } catch (err) {
    console.log(err);
  }
};

start();
