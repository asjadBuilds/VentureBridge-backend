import Conversation from '../models/conversationModel.js'
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import Message from '../models/MessageModel.js'
const getConversations = AsyncHandler(async(req,res)=>{
    const conversations = await Conversation.find({
        participants: req.user._id
    })
    res
    .status(200)
    .json(new ApiResponse(200, conversations, "User Conversations fetched Successfully"))
})
const getMessages = AsyncHandler(async(req,res)=>{
    const {conversationId} = req.body;
    const messages = await Message.find({conversation:conversationId});
    res
    .status(200)
    .json(new ApiResponse(200, messages, "Conversation messages fetched successfully"))
})