import Message from '../models/message.model.js';
import Channels from '../models/channel.model.js';
import Conversations from '../models/conversation.model.js';
import Thread from '../models/thread.model.js';
import updateConversationStatus from '../helpers/updateConversationStatus.js';
import createTodaysFirstMessage from '../helpers/createTodaysFirstUpdate.js';

// Store users' sockets by their user IDs
const users = {}

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('user-join', async ({ id, isOnline }) => {
      socket.join(id)
      await updateConversationStatus(id, isOnline)
      io.emit('user-join', { id, isOnline })
    })

    socket.on('user-leave', async ({ id, isOnline }) => {
      socket.leave(id)
      await updateConversationStatus(id, isOnline)
      io.emit('user-leave', { id, isOnline })
    })

    socket.on('channel-open', async ({ id, userId }) => {
      if (id) {
        socket.join(id)
        const updatedChannel = await Channels.findByIdAndUpdate(
          id,
          { $pull: { hasNotOpen: userId } },
          { new: true }
        )
        io.to(id).emit('channel-updated', updatedChannel)
      }
    })
    socket.on('convo-open', async ({ id, userId }) => {
      if (id) {
        socket.join(id)
        const updatedConversation = await Conversations.findByIdAndUpdate(
          id,
          { $pull: { hasNotOpen: userId } },
          { new: true }
        )
        io.to(id).emit('convo-updated', updatedConversation)
      }
    })

    socket.on('thread-message', async ({ userId, messageId, message }) => {
      try {
        socket.join(messageId)
        let newMessage = await Thread.create({
          sender: message.sender,
          content: message.content,
          message: messageId,
          hasRead: false,
        })
        newMessage = await newMessage.populate('sender')
        io.to(messageId).emit('thread-message', { newMessage })
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            threadLastReplyDate: newMessage.createdAt,
            $addToSet: { threadReplies: userId },
            $inc: { threadRepliesCount: 1 },
          },
          { new: true }
        ).populate(['threadReplies', 'sender', 'reactions.reactedToBy'])

        io.to(messageId).emit('message-updated', {
          id: messageId,
          message: updatedMessage,
        })

        // socket.emit("message-updated", { messageId, message: updatedMessage });
      } catch (error) {
        console.log(error)
      }
    })

    socket.on(
      'message',
      async ({
        channelId,
        channelName,
        conversationId,
        collaborators,
        isSelf,
        message,
        organisation,
        hasNotOpen,
      }) => {
        try {
          if (channelId) {
            socket.join(channelId)
            // Check if there are any messages for today in the channel
            await createTodaysFirstMessage({ channelId, organisation })

            let newMessage = await Message.create({
              organisation,
              sender: message.sender,
              content: message.content,
              channel: channelId,
              hasRead: false,
            })

            newMessage = await newMessage.populate('sender')
            io.to(channelId).emit('message', { newMessage, organisation })

            const updatedChannel = await Channels.findByIdAndUpdate(
              channelId,
              { hasNotOpen },
              { new: true }
            )

            io.to(channelId).emit('channel-updated', updatedChannel)
            socket.broadcast.emit('notification', {
              channelName,
              channelId,
              collaborators,
              newMessage,
              organisation,
            })
          } else if (conversationId) {
            console.log('📨 Creating message for conversation:', conversationId);
            console.log('👤 Sender:', message.sender);
            console.log('💬 Content:', message.content);
            
            socket.join(conversationId)
            // Check if there are any messages for today in the channel
            await createTodaysFirstMessage({ conversationId, organisation })
            let newMessage = await Message.create({
              organisation,
              sender: message.sender,
              content: message.content,
              conversation: conversationId,
              collaborators,
              isSelf,
              hasRead: false,
            })
            console.log('✅ Message created with ID:', newMessage._id);
            
            newMessage = await newMessage.populate('sender')
            console.log('✅ Message sender populated:', newMessage.sender ? newMessage.sender.username : 'NO SENDER');

            io.to(conversationId).emit('message', {
              collaborators,
              organisation,
              newMessage,
            })
            console.log('🚀 Message emitted to room:', conversationId)
            const updatedConversation = await Conversations.findByIdAndUpdate(
              conversationId,
              { hasNotOpen },
              { new: true }
            )
            io.to(conversationId).emit('convo-updated', updatedConversation)
            socket.broadcast.emit('notification', {
              collaborators,
              organisation,
              newMessage,
              conversationId,
            })
          }
        } catch (error) {
          console.log(error)
        }
      }
    )

    socket.on('message-view', async (messageId) => {
      const updatedMessage = await Message.findByIdAndUpdate(messageId, {
        hasRead: true,
      })
      if (updatedMessage) {
        io.emit('message-view', messageId)
      } else {
        console.log('message not found')
      }
    })

    socket.on('reaction', async ({ emoji, id, isThread, userId }) => {
      // 1. Message.findbyid(id)
      let message
      if (isThread) {
        message = await Thread.findById(id)
      } else {
        message = await Message.findById(id)
      }

      if (!message) {
        // Handle the case where the model with the given id is not found
        return
      }
      // 2. check if emoji already exists in Message.reactions array
      if (message.reactions.some((r) => r.emoji === emoji)) {
        // 3. if it does, check if userId exists in reactedToBy array
        if (
          message.reactions.some(
            (r) =>
              r.emoji === emoji &&
              r.reactedToBy.some((v) => v.toString() === userId)
          )
        ) {
          // Find the reaction that matches the emoji and remove userId from its reactedToBy array
          const reactionToUpdate = message.reactions.find(
            (r) => r.emoji === emoji
          )
          if (reactionToUpdate) {
            reactionToUpdate.reactedToBy = reactionToUpdate.reactedToBy.filter(
              (v) => v.toString() !== userId
            )

            // If reactedToBy array is empty after removing userId, remove the reaction object
            if (reactionToUpdate.reactedToBy.length === 0) {
              message.reactions = message.reactions.filter(
                (r) => r !== reactionToUpdate
              )
            }
            
            if (isThread) {
              await message.populate(['reactions.reactedToBy', 'sender'])
            } else {
              await message.populate([
                'reactions.reactedToBy',
                'sender',
                'threadReplies',
              ])
            }
            socket.emit('message-updated', { id, message, isThread })
            await message.save()
          }
        } else {
          // Find the reaction that matches the emoji and push userId to its reactedToBy array
          const reactionToUpdate = message.reactions.find(
            (r) => r.emoji === emoji
          )
          if (reactionToUpdate) {
            reactionToUpdate.reactedToBy.push(userId)
            
            if (isThread) {
              await message.populate(['reactions.reactedToBy', 'sender'])
            } else {
              await message.populate([
                'reactions.reactedToBy',
                'sender',
                'threadReplies',
              ])
            }
            socket.emit('message-updated', { id, message, isThread })
            await message.save()
          }
        }
      } else {
        // 4. if it doesn't exists, create a new reaction like this {emoji, reactedToBy: [userId]}
        message.reactions.push({ emoji, reactedToBy: [userId] })
        
        if (isThread) {
          await message.populate(['reactions.reactedToBy', 'sender'])
        } else {
          await message.populate([
            'reactions.reactedToBy',
            'sender',
            'threadReplies',
          ])
        }
        socket.emit('message-updated', { id, message, isThread })
        await message.save()
      }
    })
    // Event handler for joining a room
    socket.on('join-room', ({ roomId, userId }) => {
      // Join the specified room
      socket.join(roomId)
      // Store the user's socket by their user ID
      users[userId] = socket
      // Broadcast the "join-room" event to notify other users in the room
      socket.to(roomId).emit('join-room', { roomId, otherUserId: userId })

      console.log(`User ${userId} joined room ${roomId}`)
    })

    // Event handler for sending an SDP offer to another user
    socket.on('offer', ({ offer, targetUserId }) => {
      // Find the target user's socket by their user ID
      const targetSocket = users[targetUserId]
      if (targetSocket) {
        targetSocket.emit('offer', { offer, senderUserId: targetUserId })
      }
    })

    // Event handler for sending an SDP answer to another user
    socket.on('answer', ({ answer, senderUserId }) => {
      socket.broadcast.emit('answer', { answer, senderUserId })
    })

    // Event handler for sending ICE candidates to the appropriate user (the answerer)
    socket.on('ice-candidate', ({ candidate, senderUserId }) => {
      // Find the target user's socket by their user ID
      const targetSocket = users[senderUserId]
      if (targetSocket) {
        targetSocket.emit('ice-candidate', candidate, senderUserId)
      }
    })

    // Event handler for leaving a room
    socket.on('room-leave', ({ roomId, userId }) => {
      socket.leave(roomId)
      // Remove the user's socket from the users object
      delete users[userId]
      // Broadcast the "room-leave" event to notify other users in the room
      socket.to(roomId).emit('room-leave', { roomId, leftUserId: userId })
      console.log(`User ${userId} left room ${roomId}`)
    })
  })
}

export default initializeSocket