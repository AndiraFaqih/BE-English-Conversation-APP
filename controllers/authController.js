// 

const { createUserWithEmailAndPassword, signInWithRedirect, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { auth } = require('../config/firebaseConfig');
const bcrypt = require('bcrypt');
const db = require('../models/index');
const admin = require("firebase-admin");
const { Auth } = require('firebase-admin/auth');

class AuthController {
    static async signUpUser(req, res) {
        let token;
        const newUser = {
            email: req.body.email,
            password: req.body.password,
        };

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                newUser.email,
                newUser.password,
            );
            token = await userCredential.user.getIdToken();
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
    }

    static async signUpWithGoogle(req, res) {
        // Pastikan untuk mengimpor GoogleAuthProvider dari 'firebase/auth'
        let token;

        try {
            const userCredential = await signInWithRedirect(
                auth,
                new GoogleAuthProvider()
            );
            token = await userCredential.user.getIdToken();
            res.status(201).send({
                message: "User berhasil ditambahkan",
                token: "Bearer " + token
            });
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(400).send({ errorCode, errorMessage });
        }
    }

    static async loginUser(req, res) {
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
            const successResponse = {
                id: userId,
                message: "Login berhasil",
                userId: userId,
                token: "Bearer " + token
            }
            res.status(200).send({
                successResponse
            });
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(400).send({ errorCode, errorMessage });
        }
    }

    static logoutUser(req, res) {
        console.log(auth.currentUser);
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
    }
    // static async logoutUser(req, res) {
    //     const uid = req.uid;
    //     console.log(uid);
    //     try {
    //         if (!uid) {
    //             res.status(400).send({
    //                 msg: "GO TO LOGIN FIRST",
    //             });
    //             return;
    //         }
    //         //signout user based on uid
    //         await signOut(auth);
    //         res.status(200).send({
    //             msg: "Logout Success",
    //         });

    //     } catch (error) {
    //         console.error("Error logging out:", error);
    //         res.status(500).send({
    //             msg: "INTERNAL SERVER ERROR",
    //             errorCode: error.code,
    //         });
    //     }
    // }
    
    
}

module.exports = AuthController;
