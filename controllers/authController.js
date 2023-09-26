//import db, auth and storage from config/firebaseConfig.js
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('../config/firebaseConfig');
const bcrypt = require('bcrypt');
const db = require('../models/index');

//sign up
exports.signUpUser = async (req, res) => {
    let token;
    const newUser = {
        email: req.body.email,
        password: req.body.password,
    };
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            newUser.email, 
            newUser.password
        );
        const uid = userCredential.user.uid;
        token = await userCredential.user.getIdToken();
        const userSchema = {
            email: newUser.email,
            password: newUser.password,
            createdAt: new Date().toISOString(),
        };
        await db.collection('Users').doc(uid).set(userSchema);
        res.status(201).send({ 
            message: "User berhasil ditambahkan", 
            token: token 
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).send({ errorCode, errorMessage });
    }
};
