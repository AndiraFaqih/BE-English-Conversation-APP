//import db, auth and storage from config/firebaseConfig.js
const { createUserWithEmailAndPassword, 
        signInWithRedirect, 
        signInWithEmailAndPassword 
    } = require('firebase/auth');
const { auth } = require('../config/firebaseConfig');
const {signOut} = require('firebase/auth');
const bcrypt = require('bcrypt');
const db = require('../models/index');
const admin = require("firebase-admin");

//sign up user 
exports.signUpUser = async (req, res) => {
    let token;
    const newUser = {
        email: req.body.email,
        password: req.body.password,
    };

    // const salt = await bcrypt.genSalt(10);
    // newUser.password = await bcrypt.hash(newUser.password, salt);

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            newUser.email, 
            newUser.password,
        );

        // const uid = userCredential.user.uid;
        token = await userCredential.user.getIdToken();

        // const userSchema = {
        //     email: newUser.email,
        //     password: newUser.password,
        //     username:"",
        //     photoProfile:"",
        //     createdAt: new Date().toISOString(),
        // };

        // const options = {
        //     ignoreUndefinedProperties: true,
        // };

        // await db.collection('Users').doc(uid).set(userSchema, options);
        res.status(201).send({ 
            UUID: userCredential.user.uid,
            message: "User berhasil ditambahkan", 
            token: "Bearer " + token 
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
            token: "Bearer " + token 
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).send({ errorCode, errorMessage });
    }
};

// exports.loginUser = async (req, res) => {
//     let token; 
//     const user = {
//         email: req.body.email,
//         password: req.body.password,
//     };

//     const userCredential = await db.collection('Users').where('email', '==', user.email).get();

//     if (userCredential.empty) {
//         return res.status(400).send({ message: "Email tidak ditemukan" });
//     }

//     const userSchema = userCredential.docs[0].data();
//     const isPasswordMatch = await bcrypt.compare(user.password, userSchema.password);

//     if (!isPasswordMatch) {
//         return res.status(400).send({ message: "Password salah" });
//     }
    
//     try {
//         const userCredential = await signInWithEmailAndPassword(
//             auth,
//             user.email,
//             userSchema.password
//         );

//         token = await userCredential.user.getIdToken();
//         res.status(200).send({ 
//             message: "Login berhasil", 
//             token: "Bearer " + token  
//         });
//     } catch (error) {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         res.status(400).send({ errorCode, errorMessage });
//     }
// };

exports.loginUser = async (req, res) => {
    let token; 
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            user.email,
            user.password
        );

        token = await userCredential.user.getIdToken();

        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        res.status(200).send({ 
            id: userId,
            message: "Login berhasil", 
            userId: userId,
            token: "Bearer " + token  
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).send({ errorCode, errorMessage });
    }
};

//sign out user
exports.logoutUser = (req, res) => {
    try {
        if (auth.currentUser === null) {
            res.status(400).send({
                msg: "GO TO LOGIN FIRST",
            });
        } else {
            signOut(auth).then(() => {
                res.status(200).send({
                    msg: "Logout Success",
                });
            });
        }
    } catch (error) {
        res.status(500).send({
            msg: "INTERNAL SERVER ERROR",
            errorCode: error.code,
        });
    }
};

