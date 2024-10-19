const {conversationModel}=require("../models/ConversationModel");

const getConversation=async (currUserId)=> {
    if(currUserId){
        const currUserConversation=await conversationModel.find({
            "$or": [
                {sender: currUserId},
                {receiver: currUserId}
            ]
        }).sort({updatedAt: -1}).populate("messages").populate("sender").populate("receiver");

        const currConversation=currUserConversation.map((convo)=> {
            const countUnseenMsg=convo?.messages?.reduce((prev, curr)=> {
                const msgByUserId=curr?.msgByUserId?.toString();

                if(msgByUserId!==currUserId){
                    return prev+(curr?.seen ? 0 : 1)
                }else{
                    return prev
                }
            }, 0);

            return {
                _id: convo?._id,
                sender: convo?.sender,
                receiver: convo?.receiver,
                unseenMsg: countUnseenMsg,
                lastMsg: convo?.messages[convo?.messages?.length-1]
            }
        })

        return currConversation;
    }else{
        return [];
    }
}

module.exports=getConversation;