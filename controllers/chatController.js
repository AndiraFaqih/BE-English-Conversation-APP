const { auth } = require('../config/firebaseConfig');
const db = require('../models/index');

exports.postChat = async (req, res) => {
    const idUser = auth.currentUser.uid;

    if (!idUser) {
        return res.status(401).json({
            status: 'error',
            message: 'Pengguna tidak terautentikasi.',
        });
    }

    const messageText = req.body.messageText;

    try {
        const messageRef = await db.collection('Message').add({
            idUser: idUser,
            messageText: messageText,
            createdAt: new Date().toISOString(),
        });

        const messageId = messageRef.id;
        const AIMessageText = "A";

        await db.collection('AIMessage').add({
            idMessage: messageId,
            AIMessageText: AIMessageText,
            createdAt: new Date().toISOString(),
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
            message: 'Terjadi kesalahan dalam menambahkan chat.',
        });
    }
};



    
