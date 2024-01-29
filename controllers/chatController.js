const fs = require('fs');
const { exec } = require('child_process');
const { auth } = require('../config/firebaseConfig');
const db = require('../models/index');
const { OpenAIAPIKey } = require('../config/firebaseConfig');
const axios = require('axios');
const OpenAI = require("openai");
const dotenv = require("dotenv");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
dotenv.config();
const ffprobeStatic = require('ffprobe-static');


exports.postChat = async (req, res) => {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    const OPENAIAPIKEY = process.env.OPENAI_API_KEY;

    const openai = new OpenAI({
        apiKey: OPENAIAPIKEY,
    });

    const inputVoice = "nova";
    const inputModel = "tts-1";

    let chatHistory = [];
    let tempAudioFiles = []; // Array untuk menyimpan path file audio sementara

    const url = "https://api.openai.com/v1/audio/speech";
    const headers = {
        Authorization: `Bearer ${OPENAIAPIKEY}`,
        'Content-Type': 'application/json'
    };

    const idUser = req.user.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    const messageText = req.body.messageText;
    const chatRoomId = req.params.chatRoomId;

    try {
        const messagesSnapshot = await db.collection('Message').where('chatRoomId', '==', chatRoomId).get();

        messagesSnapshot.forEach((doc) => {
            const messageData = doc.data();
            chatHistory.push({
                role: messageData.idUser === idUser ? "user" : "assistant",
                content: messageData.messageText,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan dalam mengambil chat.',
        });
    }

    const messages = [
        {
            role: "system",
            content: "You are a helpful assistant providing concise responses in at most two sentences. Your name is Elara.",
        },
        ...chatHistory,
        { role: "user", content: messageText },
    ];

    try {
        const messageRef = await db.collection('Message').add({
            idUser: idUser,
            messageText: messageText,
            createdAt: new Date().toISOString(),
            chatRoomId: chatRoomId,
        });

        const messageId = messageRef.id;

        const aiChatResponse = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
        });
        const aiChatResponseText = aiChatResponse.choices[0].message.content;

        chatHistory.push({ role: "user", content: messageText }, { role: "assistant", content: aiChatResponseText });

        await db.collection('AIMessage').add({
            idMessage: messageId,
            AIMessageText: aiChatResponseText,
            createdAt: new Date().toISOString(),
            chatRoomId: chatRoomId,
        });

        const data = {
            model: inputModel,
            input: aiChatResponseText,
            voice: inputVoice,
            response_format: "mp3",
        };

        const audioResponse = await axios.post(url, data, {
            headers: headers,
            responseType: "stream",
        });

        const tempFilePath = `tempAudio-${Date.now()}.mp3`;
        const writer = fs.createWriteStream(tempFilePath);
        audioResponse.data.pipe(writer);
        tempAudioFiles.push(tempFilePath);

    } catch (error) {
        console.error(error);
        if (error.audioResponse) {
            return res.status(500).json({
                status: 'error',
                message: `Error with HTTP request: ${error.audioResponse.status} - ${error.audioResponse.statusText}`,
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan dalam menambahkan chat.',
        });
    }

    ffmpeg.setFfmpegPath(ffmpegStatic);

    // Fungsi untuk menggabungkan file audio
    const mergeAudioFiles = (files, outputPath) => {
        return new Promise((resolve, reject) => {
            let command = ffmpeg();

            files.forEach(file => {
                command = command.input(file);
            });

            command
                .on('error', (err) => {
                    console.error(`Error: ${err.message}`);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Audio files merged successfully');
                    resolve(outputPath);
                })
                .mergeToFile(outputPath, '/tmp');
        });
    };

    try {
        const mergedAudioName = `mergedAudio-${Date.now()}.mp3`;
        //create file path for merged audio linear with app.js
        const mergedAudioPath = path.join(__dirname, '..', 'temp', mergedAudioName);
        await mergeAudioFiles(tempAudioFiles, mergedAudioPath);
        
        res.sendFile(mergedAudioPath, function(err) {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Internal Server Error");
            } else {
                console.log("File sent successfully.");
    
                // Bersihkan: Hapus file sementara dan file gabungan
                tempAudioFiles.forEach(file => fs.unlinkSync(file));
                fs.unlinkSync(mergedAudioPath);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error in merging audio files');
    }



    // Return text response

    // try {
    //     // Access the Message collection directly
    //     const messageRef = await db.collection('Message').add({
    //         idUser: idUser,
    //         messageText: messageText,
    //         createdAt: new Date().toISOString(),
    //         chatRoomId: chatRoomId, // Include chatRoomId as a field
    //     });

    //     const messageId = messageRef.id;

    //     // Send messages to the chatbot and get the response
    //     const aiChatResponse = await openai.chat.completions.create({
    //         messages: messages,
    //         model: "gpt-3.5-turbo",
    //     });
    //     const aiChatResponseText = aiChatResponse.choices[0].message.content;

    //     chatHistory.push(
    //         { role: "user", content: messageText },
    //         { role: "assistant", content: aiChatResponseText }
    //     );

    //     console.log(`Assistant said: ${aiChatResponseText}`);

    //     // Access the AIMessage collection directly
    //     await db.collection('AIMessage').add({
    //         idMessage: messageId,
    //         AIMessageText: aiChatResponseText,
    //         createdAt: new Date().toISOString(),
    //         chatRoomId: chatRoomId,
    //     });

    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             messageText: messageText,
    //             AIMessageText: aiChatResponseText,
    //         },
    //     });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({
    //         status: 'error',
    //         message: 'Terjadi kesalahan dalam menambahkan chat.',
    //     });
    // }
};

async function retrieveChatHistory(chatRoomId, idUser) {
    let chatHistory = [];

    // get chat history from database from the chat room
    try {
        const messagesSnapshot = await db.collection('Message').where('chatRoomId', '==', chatRoomId).orderBy('createdAt').get();

        messagesSnapshot.forEach((doc) => {
            const messageData = doc.data();
            const message = {
                role: messageData.idUser === idUser ? "user" : "assistant",
                content: messageData.messageText,
            };
            chatHistory.push(message);
        });
    } catch (error) {
        console.error('Error retrieving chat history:', error);
        throw error;
    }

    return chatHistory;
}

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
