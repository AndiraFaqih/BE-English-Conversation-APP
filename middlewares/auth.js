const db = require('../models/index');
const { getAuth } = require('firebase-admin/auth');

exports.authCheck = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        return res.status(401).send({ 
            error: 'UNAOUTHORIZED'
        });
    }
    getAuth()
    .verifyIdToken(token)
    .then((decodedToken) => {
        req.user = decodedToken;
        return (uid = decodedToken.uid);
    })
    .then((data) => {
        if (data) {
            next();
        } else {
            res.status(403).send({
                msg: "FORBIDDEN",
            });
        }
    })
    .catch((error) => {
        if (error.code === "auth/id-token-expired") {
            res.status(400).send({
                error: "TOKEN EXPIRED",
                message: "PLEASE LOGIN AGAIN !",
            });
        } else {
            res.status(500).send({
                error: "INTERNAL SERVER ERROR",
            });
        }
    });
}

exports.isUser = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split("Bearer ");
    } else {
        return res.status(403).send({
            error: "UNAUTHORIZED",
        });
    }
    getAuth()
        .verifyIdToken(token[1])
        .then((decodedToken) => {
            req.user = decodedToken;
            return (uid = decodedToken.uid);
        })
        .then((data) => {
            const userDoc = db.collection("Users").doc(data);
            const user = userDoc.get();
            user.then((data) => {
                if (data.exists) {
                    next();
                } else {
                    res.status(403).send({
                        error: "FORBIDDEN",
                        message: "You aren't User",
                    });
                }
            });
        })
        .catch((error) => {
            if (error.code === "auth/id-token-expired") {
                res.status(400).send({
                    error: "TOKEN EXPIRED",
                    message: "PLEASE LOGIN AGAIN !",
                });
            } else {
                res.status(500).send({
                    error: "INTERNAL SERVER ERROR",
                });
            }
        });
};






