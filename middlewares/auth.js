//auth middleware use firebase
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//get user from token
const getUserFromToken = async (token) => {
    try {
        const { id } = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);
        return user;
    } catch (error) {
        return null;
    }
};

//check if user is authenticated
const auth = async (req, res, next) => {
    const token = req.cookies.token;
    const user = await getUserFromToken(token);
    if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
};

//if user logged succesfully create token and set cookie
const login = async (req, res) => {
    const { username, password } = req.body;
    //check  username and password are correct
    const user = await User.checkCredentials(username, password);
    if (!user) {
        return res.status(401).send({ error: 'Invalid username or password' });
    }
    const token = await user.generateToken();
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.send({ user });
};

//check credentials and create new user
const signup = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    const token = await user.generateToken();
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.status(201).send({ user });
}




