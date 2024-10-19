const express=require("express");
const {Server}=require("socket.io");
const http=require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetails");
const userModel = require("../models/UserModel");
const {conversationModel, messageModel}=require("../models/ConversationModel");
const getConversation=require("../helpers/getConversation");

const app=express();

const server=http.createServer(app);
const io=new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

const onlineUsers=new Set();

io.on("connection", async (socket)=> {
    console.log("User with id: "+socket.id+" connected");

    const token=socket.handshake.auth.token;
    
    // Current user details
    const user=await getUserDetailsFromToken(token);
    
    // Create a room
    socket.join(user?._id?.toString());
    onlineUsers.add(user?._id?.toString());

    io.emit("onlineUser", Array.from(onlineUsers));

    socket.on("message-page", async (userId)=> {
        const userDetails=await userModel.findById(userId).select("-password");

        const payload={
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            online: onlineUsers.has(userId),
            profile_pic: userDetails?.profile_pic
        }

        socket.emit("message-user", payload);

        const getConversationMessage=await conversationModel.findOne({
            "$or": [
                {sender: user?._id, receiver: userId},
                {sender: userId, receiver: user?._id}
            ]
        }).populate("messages").sort({updatedAt:-1});

        // Previous message
        socket.emit("message", getConversationMessage?.messages || []);
    });

    // New message
    socket.on("new-message", async (data)=> {
        // check whether conversation is available for both users
        let conversation=await conversationModel.findOne({
            "$or": [
                {sender: data?.sender, receiver: data?.receiver},
                {sender: data?.receiver, receiver: data?.sender}
            ]
        });

        if(!conversation){
            const createConversation=await conversationModel({
                sender: data?.sender,
                receiver: data?.receiver
            });

            conversation=await createConversation.save();
        }

        const message=new messageModel({
            text: data?.text,
            imageUrl: data?.imageUrl,
            videoUrl: data?.videoUrl,
            msgByUserId: data?.msgByUserId
        });

        const savedMessage=await message.save();

        const updatedConversation=await conversationModel.updateOne({_id: conversation?._id}, {
            "$push": {messages: savedMessage?._id}
        });

        const getConversationMessage=await conversationModel.findOne({
            "$or": [
                {sender: data?.sender, receiver: data?.receiver},
                {sender: data?.receiver, receiver: data?.sender}
            ]
        }).populate("messages").sort({updatedAt:-1});

        io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
        io.to(data?.receiver).emit("message", getConversationMessage?.messages || []);

        // Send conversation
        const conversationSender=await getConversation(data?.sender);
        const conversationReceiver=await getConversation(data?.receiver);

        io.to(data?.sender).emit("conversation", conversationSender);
        io.to(data?.receiver).emit("conversation", conversationReceiver);
    });

    // Side bar
    socket.on("sidebar", async (currUserId)=> {
        const conversation=await getConversation(currUserId);

        socket.emit("conversation", conversation);
    });

    socket.on("seen", async (msgByUserId)=> {
        const conversation=await conversationModel.findOne({
            "$or": [
                {sender: user?._id, receiver: msgByUserId},
                {sender: msgByUserId, receiver: user?._id}
            ]
        });

        const conversationMessageId=conversation?.messages || [];

        const updateMessages=await messageModel.updateMany(
            {_id: {"$in": conversationMessageId}, msgByUserId: msgByUserId},
            {"$set": {seen: true}}
        );

        // Send conversation
        const conversationSender=await getConversation(user?._id?.toString());
        const conversationReceiver=await getConversation(msgByUserId);

        io.to(user?._id?.toString()).emit("conversation", conversationSender);
        io.to(msgByUserId).emit("conversation", conversationReceiver);
    });

    // Delete messages
    socket.on("delete-message", async ({messageId, type, senderId, receiverId})=> {
        if(type==="me"){
            await messageModel.updateOne({_id: messageId, msgByUserId: senderId}, {$set: {deleteBySender: true}});
            io.to(senderId).emit("message-deleted", messageId);
        }else if(type==="everyone"){
            await messageModel.deleteOne({_id: messageId});
            io.to(senderId).emit("message-deleted", messageId);
            io.to(receiverId).emit("message-deleted", messageId);
        }
    });

    socket.on("disconnect", ()=> {
        onlineUsers.delete(user?._id?.toString());
        console.log("User with id: "+socket.id+" disconnected");
    })
});

module.exports={
    app,
    server
};