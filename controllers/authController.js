//import db, auth and storage from config/firebaseConfig.js
const { createUserWithEmailAndPassword, 
        signInWithRedirect, 
        signInWithEmailAndPassword 
    } = require('firebase/auth');
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

//sign up and create account with google signinwithredirect
exports.signUpWithGoogle = async (req, res) => {
    let token;
    try {
        const userCredential = await signInWithRedirect(
            auth,
            new GoogleAuthProvider()
        );
        const uid = userCredential.user.uid;
        token = await userCredential.user.getIdToken();
        const userSchema = {
            email: userCredential.user.email,
            password: userCredential.user.password,
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

//login user with comparing password with bcrypt
exports.loginUser = async (req, res) => {
    let token;
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const userCredential = await db.collection('Users').where('email', '==', user.email).get();

    if (userCredential.empty) {
        return res.status(400).send({ message: "Email tidak ditemukan" });
    }

    const userSchema = userCredential.docs[0].data();
    const isPasswordMatch = await bcrypt.compare(user.password, userSchema.password);

    if (!isPasswordMatch) {
        return res.status(400).send({ message: "Password salah" });
    }
    
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            user.email,
            userSchema.password
        );
        token = await userCredential.user.getIdToken();
        res.status(200).send({ message: "Login berhasil", token: token });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).send({ errorCode, errorMessage });
    }
};

//sign out user
exports.logoutUser = async (req, res) => {
    try {
        await auth.signOut();
        res.status(200).send({ message: "Sign out berhasil" });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).send({ errorCode, errorMessage });
    }
}

