const { auth } = require('../config/firebaseConfig');
const db = require('../models/index');
const { OpenAIAPIKey } = require('../config/firebaseConfig');
const axios = require('axios');
const OpenAI = require("openai");

exports.postChat = async (req, res) => {
    const openai = new OpenAI({
        apiKey: OpenAIAPIKey,
    });

    let chatHistory = [];


    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    const messageText = req.body.messageText;
    const chatRoomId = req.params.chatRoomId;

    // Prepare messages for the chatbot, including the user's text input
    const messages = [
        {
            role: "system",
            content:
                "You are a helpful assistant providing concise responses in at most two sentences. Your name is Elara.",
        },
        ...chatHistory,
        { role: "user", content: messageText },
    ];

    try {
        // Access the Message collection directly
        const messageRef = await db.collection('Message').add({
            idUser: idUser,
            messageText: messageText,
            createdAt: new Date().toISOString(),
            chatRoomId: chatRoomId, // Include chatRoomId as a field
        });

        const messageId = messageRef.id;

        // Send messages to the chatbot and get the response
        const aiChatResponse = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
        });
        const aiChatResponseText = aiChatResponse.choices[0].message.content;

        chatHistory.push(
            { role: "user", content: messageText },
            { role: "assistant", content: aiChatResponseText }
        );

        console.log(`Assistant said: ${aiChatResponseText}`);


        // const openaiResponse = await axios.post(
        //     'https://api.openai.com/v1/chat/completions',
        //     {
        //         model: 'gpt-3.5-turbo',
        //         messages: [
        //             { role: 'system', content: 'You are a chatbot assistant.' },
        //             { role: 'user', content: messageText },
        //         ],
        //     },
        //     {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${OpenAIAPIKey}`,
        //         },
        //     }
        // );

        // Access the AIMessage collection directly
        await db.collection('AIMessage').add({
            idMessage: messageId,
            AIMessageText: aiChatResponseText,
            createdAt: new Date().toISOString(),
            chatRoomId: chatRoomId,
        });

        res.status(200).json({
            status: 'success',
            data: {
                messageText: messageText,
                AIMessageText: aiChatResponseText,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan dalam menambahkan chat.',
        });
    }
};

exports.editChat = async (req, res) => {
    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    const idMessage = req.params.idMessage;
    const messageText = req.body.messageText;
    const chatRoomId = req.params.chatRoomId;

    try {
        // Access the Message collection directly
        const messageRef = await db.collection('Message').doc(idMessage).get();

        if (!messageRef.exists) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat tidak ditemukan.',
            });
        }

        const messageData = messageRef.data();

        if (messageData.idUser !== idUser || messageData.chatRoomId !== chatRoomId) {
            return res.status(403).json({
                status: 'error',
                message: 'Anda tidak memiliki akses untuk mengubah chat ini.',
            });
        }

        await messageRef.ref.update({
            messageText: messageText,
        });

        // Access the AIMessage collection directly
        const AIMessageRef = await db.collection('AIMessage').where('idMessage', '==', idMessage).get();
        let aiMessageData;
        let AIMessageText = "Aaaaa";

        AIMessageRef.forEach((doc) => {
            aiMessageData = doc.data();
            doc.ref.update({
                AIMessageText: AIMessageText,
            });
        });

        res.status(200).json({
            status: 'success',
            data: {
                messageText: messageText,
                AIMessageText: AIMessageText,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan dalam mengubah chat.',
        });
    }
};

exports.deleteChat = async (req, res) => {
    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    const idMessage = req.params.idMessage;
    const chatRoomId = req.params.chatRoomId;

    try {
        // Access the Message collection directly
        const messageRef = await db.collection('Message').doc(idMessage).get();

        if (!messageRef.exists) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat tidak ditemukan.',
            });
        }

        const messageData = messageRef.data();

        if (messageData.idUser !== idUser || messageData.chatRoomId !== chatRoomId) {
            return res.status(403).json({
                status: 'error',
                message: 'Anda tidak memiliki akses untuk menghapus chat ini.',
            });
        }

        await messageRef.ref.delete();

        // Access the AIMessage collection directly
        const AIMessageRef = await db.collection('AIMessage').where('idMessage', '==', idMessage).get();

        AIMessageRef.forEach((doc) => {
            doc.ref.delete();
        });

        res.status(200).json({
            status: 'success',
            data: {
                idMessage: idMessage,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan dalam menghapus chat.',
        });
    }
};

exports.createChatRoom = async (req, res) => {
    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    try {
        const chatRoomRef = await db.collection('ChatRooms').add({
            idUser: idUser,
            createdAt: new Date().toISOString(),
        });

        return res.status(200).json({
            status: 'success',
            data: {
                chatRoomId: chatRoomRef.id,
                message: 'New chat room created successfully.',
            },
        });
    } catch (error) {
        console.error('Error creating new chat room: ', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create new chat room.',
        });
    }
};

exports.getUserChatRooms = async (req, res) => {
    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'User not authenticated.',
        });
    }

    try {
        const chatRoomsSnapshot = await db.collection('ChatRooms').where('idUser', '==', idUser).get();
        const chatRooms = [];
        chatRoomsSnapshot.forEach(doc => {
            chatRooms.push({ id: doc.id, ...doc.data() });
        });

        return res.status(200).json({
            status: 'success',
            data: chatRooms,
        });
    } catch (error) {
        console.error('Error retrieving chat rooms: ', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve chat rooms.',
        });
    }
};

exports.deleteChatRoom = async (req, res) => {
    const idUser = req.user.uid;
    const chatRoomId = req.params.chatRoomId;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'User not authenticated.',
        });
    }

    try {
        const chatRoomRef = db.collection('ChatRooms').doc(chatRoomId);
        const chatRoomDoc = await chatRoomRef.get();

        if (!chatRoomDoc.exists || chatRoomDoc.data().idUser !== idUser) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat room not found or user does not have permission.',
            });
        }

        // Delete chat room and its messages
        const messagesQuery = db.collection('Message').where('chatRoomId', '==', chatRoomId);
        const messagesSnapshot = await messagesQuery.get();

        const batch = db.batch();
        messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Also delete AIMessages associated with the chat room
        const AIMessagesQuery = db.collection('AIMessage').where('chatRoomId', '==', chatRoomId);
        const AIMessagesSnapshot = await AIMessagesQuery.get();

        AIMessagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        await chatRoomRef.delete();

        return res.status(200).json({
            status: 'success',
            message: 'Chat room and all related messages and AIMessages have been deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting chat room: ', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete chat room.',
        });
    }
};
