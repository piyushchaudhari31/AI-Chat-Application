require('dotenv').config()

const { text } = require('stream/consumers');
const app = require("./src/app");
const generateContent = require('./src/service/ai.service')
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors:{
    origin:"http://localhost:5173"
  }
});

const chatHistory = []

io.on("connection", (socket) => {
  console.log("user is connected");

  socket.on("disconnect",(socket)=>{
    console.log("user is disconnected");
  })

  socket.on("ai-content",async(data)=>{

    chatHistory.push({
        role:"user",
        parts:[{text:data}]
    })
    const response = await generateContent(chatHistory)

    chatHistory.push({
        role:"model",
        parts:[{text:response}]
    })
    socket.emit("ai-content-reply",response);
    
  })

});

httpServer.listen(3000,()=>{
    console.log("server is running on port 3000");
    
});

