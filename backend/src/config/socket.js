import Message from '../models/message.model.js';
import Channels from '../models/channel.model.js';
import Conversations from '../models/conversation.model.js';
import Thread from '../models/thread.model.js';
import List from '../models/list.model.js';
import ListItem from '../models/listItem.model.js';
import updateConversationStatus from '../helpers/updateConversationStatus.js';
import createTodaysFirstMessage from '../helpers/createTodaysFirstUpdate.js';
import { createNotifications } from '../helpers/createNotifications.js';

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
        ).populate('collaborators')
        io.to(id).emit('convo-updated', updatedConversation)
      }
    })

    socket.on('thread-open', async ({ messageId, userId }) => {
      if (messageId) {
        console.log(`🧵 User ${userId} joined thread room ${messageId}`)
        socket.join(messageId)
        console.log(`✅ User successfully joined thread room ${messageId}`)
      }
    })

    socket.on('thread-message', async ({ userId, messageId, message }) => {
      try {
        console.log(`📤 Received thread-message event from user ${userId} for message ${messageId}`)
        socket.join(messageId)
        let newMessage = await Thread.create({
          sender: message.sender,
          content: message.content,
          message: messageId,
          hasRead: false,
        })
        newMessage = await newMessage.populate('sender')
        console.log(`✅ Broadcasting thread-message to room ${messageId}:`, newMessage._id)
        // Use io.in() to broadcast to ALL sockets in the room, including sender
        io.in(messageId).emit('thread-message', { newMessage })
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            threadLastReplyDate: newMessage.createdAt,
            $addToSet: { threadReplies: userId },
            $inc: { threadRepliesCount: 1 },
          },
          { new: true }
        ).populate(['threadReplies', 'sender', 'reactions.reactedToBy'])

        // Broadcast parent message update to ALL sockets in thread room
        io.in(messageId).emit('message-updated', {
          id: messageId,
          message: updatedMessage,
          isThread: false, // This is updating the parent message
        })
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

            const messageData = {
              organisation,
              sender: message.sender,
              content: message.content,
              channel: channelId,
              hasRead: false,
            }

            // Handle file attachments
            if (message.attachments && message.attachments.length > 0) {
              messageData.attachments = message.attachments
              messageData.type = 'file'
            }

            let newMessage = await Message.create(messageData)

            newMessage = await newMessage.populate('sender')
            io.to(channelId).emit('message', { newMessage, organisation })

            const updatedChannel = await Channels.findByIdAndUpdate(
              channelId,
              { hasNotOpen },
              { new: true }
            )

            io.to(channelId).emit('channel-updated', updatedChannel)
            
            // Create notifications for mentions
            await createNotifications({
              message: newMessage,
              organisationId: organisation,
              senderId: message.sender,
              io,
            })
            
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
            
            const messageData = {
              organisation,
              sender: message.sender,
              content: message.content,
              conversation: conversationId,
              collaborators,
              isSelf,
              hasRead: false,
            }

            // Handle file attachments
            if (message.attachments && message.attachments.length > 0) {
              messageData.attachments = message.attachments
              messageData.type = 'file'
            }

            let newMessage = await Message.create(messageData)
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
            ).populate('collaborators')
            io.to(conversationId).emit('convo-updated', updatedConversation)
            
            // Create notifications for mentions
            await createNotifications({
              message: newMessage,
              organisationId: organisation,
              senderId: message.sender,
              io,
            })
            
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

    socket.on('edit-message', async ({ messageId, newContent, isThread }) => {
      try {
        let message
        if (isThread) {
          message = await Thread.findById(messageId)
        } else {
          message = await Message.findById(messageId)
        }

        if (!message) {
          console.log('Message not found')
          return
        }

        // Update the message content
        message.content = newContent
        await message.save()

        // Populate the message with related data
        if (isThread) {
          await message.populate(['reactions.reactedToBy', 'sender'])
        } else {
          await message.populate([
            'reactions.reactedToBy',
            'sender',
            'threadReplies',
          ])
        }

        // Determine the room to broadcast to
        const roomId = isThread ? message.message : (message.channel || message.conversation)

        // Broadcast the updated message to all users in the room
        io.to(roomId.toString()).emit('message-updated', { id: messageId, message, isThread })
      } catch (error) {
        console.log('Error editing message:', error)
      }
    })

    socket.on('delete-message', async ({ messageId, isThread }) => {
      try {
        let message
        if (isThread) {
          message = await Thread.findById(messageId)
        } else {
          message = await Message.findById(messageId)
        }

        if (!message) {
          console.log('Message not found')
          return
        }

        // Determine the room to broadcast to
        const roomId = isThread ? message.message : (message.channel || message.conversation)

        // Delete the message
        if (isThread) {
          await Thread.findByIdAndDelete(messageId)
          
          // Update parent message thread count when thread message is deleted
          const parentMessage = await Message.findById(message.message)
          if (parentMessage) {
            const updatedMessage = await Message.findByIdAndUpdate(
              message.message,
              {
                $inc: { threadRepliesCount: -1 },
                $pull: { threadReplies: message.sender },
              },
              { new: true }
            ).populate(['threadReplies', 'sender', 'reactions.reactedToBy'])
            
            // Broadcast parent message update
            io.to(message.message.toString()).emit('message-updated', {
              id: message.message.toString(),
              message: updatedMessage,
              isThread: false, // This is updating the parent, not the thread itself
            })
          }
        } else {
          await Message.findByIdAndDelete(messageId)
        }

        // Broadcast the deletion to all users in the room
        io.to(roomId.toString()).emit('message-deleted', { id: messageId, isThread })
      } catch (error) {
        console.log('Error deleting message:', error)
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
      
      // Determine the room to broadcast to
      const roomId = isThread ? message.message : (message.channel || message.conversation)
      
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
            
            await message.save()
            
            if (isThread) {
              await message.populate(['reactions.reactedToBy', 'sender'])
            } else {
              await message.populate([
                'reactions.reactedToBy',
                'sender',
                'threadReplies',
              ])
            }
            
            // Broadcast to all users in the room
            io.to(roomId.toString()).emit('message-updated', { id, message, isThread })
          }
        } else {
          // Find the reaction that matches the emoji and push userId to its reactedToBy array
          const reactionToUpdate = message.reactions.find(
            (r) => r.emoji === emoji
          )
          if (reactionToUpdate) {
            reactionToUpdate.reactedToBy.push(userId)
            
            await message.save()
            
            if (isThread) {
              await message.populate(['reactions.reactedToBy', 'sender'])
            } else {
              await message.populate([
                'reactions.reactedToBy',
                'sender',
                'threadReplies',
              ])
            }
            
            // Broadcast to all users in the room
            io.to(roomId.toString()).emit('message-updated', { id, message, isThread })
          }
        }
      } else {
        // 4. if it doesn't exists, create a new reaction like this {emoji, reactedToBy: [userId]}
        message.reactions.push({ emoji, reactedToBy: [userId] })
        
        await message.save()
        
        if (isThread) {
          await message.populate(['reactions.reactedToBy', 'sender'])
        } else {
          await message.populate([
            'reactions.reactedToBy',
            'sender',
            'threadReplies',
          ])
        }
        
        // Broadcast to all users in the room
        io.to(roomId.toString()).emit('message-updated', { id, message, isThread })
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

    // ========== List-related socket events ==========

    // Event handler for opening a list
    socket.on('list-open', async ({ listId, userId }) => {
      if (listId) {
        socket.join(listId)
        console.log(`📋 User ${userId} joined list room ${listId}`)
        
        // Update lastViewedBy
        await List.findByIdAndUpdate(listId, {
          $addToSet: {
            lastViewedBy: {
              userId,
              timestamp: new Date(),
            },
          },
        })
      }
    })

    // Event handler for creating a list item
    socket.on('list-item-create', async ({ listId, item }) => {
      try {
        console.log(`📝 Creating list item in list ${listId}`)
        const newItem = await ListItem.create(item)
        console.log(`✅ Broadcasting list-item-create to room ${listId}:`, newItem._id)
        io.to(listId).emit('list-item-create', { newItem })
      } catch (error) {
        console.log('Error in list-item-create:', error)
      }
    })

    // Event handler for updating a list item
    socket.on('list-item-update', async ({ listId, itemId, data }) => {
      try {
        console.log(`✏️ Updating list item ${itemId} in list ${listId}`)
        const updatedItem = await ListItem.findByIdAndUpdate(itemId, data, {
          new: true,
        })
        if (updatedItem) {
          io.to(listId).emit('list-item-update', { itemId, item: updatedItem })
        }
      } catch (error) {
        console.log('Error in list-item-update:', error)
      }
    })

    // Event handler for deleting a list item
    socket.on('list-item-delete', async ({ listId, itemId }) => {
      try {
        console.log(`🗑️ Deleting list item ${itemId} from list ${listId}`)
        await ListItem.findByIdAndDelete(itemId)
        io.to(listId).emit('list-item-delete', { itemId })
      } catch (error) {
        console.log('Error in list-item-delete:', error)
      }
    })

    // Event handler for updating list metadata (title, description, etc.)
    socket.on('list-update', async ({ listId, data }) => {
      try {
        console.log(`📋 Updating list ${listId}`)
        const updatedList = await List.findByIdAndUpdate(listId, data, {
          new: true,
        })
          .populate('collaborators')
          .populate('createdBy')
        if (updatedList) {
          io.to(listId).emit('list-update', { list: updatedList })
        }
      } catch (error) {
        console.log('Error in list-update:', error)
      }
    })

    // Event handler for updating list columns
    socket.on('list-column-update', async ({ listId, columns }) => {
      try {
        console.log(`📊 Updating columns for list ${listId}`)
        const updatedList = await List.findByIdAndUpdate(
          listId,
          { columns },
          { new: true }
        )
          .populate('collaborators')
          .populate('createdBy')
        if (updatedList) {
          io.to(listId).emit('list-column-update', { columns })
        }
      } catch (error) {
        console.log('Error in list-column-update:', error)
      }
    })
  })
}

export default initializeSocket