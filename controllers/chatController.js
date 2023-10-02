const { auth } = require('../config/firebaseConfig');
const db = require('../models/index');

exports.postChat = async (req, res) => {
    const idUser = "123"; //temporary static idUser

    const chatText = req.body.chatText;

    try {
        const chatRef = await db.collection('chat').add({
            idUser: idUser,
        });

        const chatId = chatRef.id;

        const userChatRef = await db.collection('userChat').add({
            idUser: idUser,
            chatText: chatText,
        });

        const userChatId = userChatRef.id;

        await db.collection('chat').doc(chatId).update({
            userChatId: userChatId,
        });

        res.status(200).json({
            status: 'success',
            data: {
                chatId: chatId,
                userChatId: userChatId,
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



    
