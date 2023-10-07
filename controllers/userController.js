const { auth, firestore, storage } = require('../config/firebaseConfig');
const db = require('../models/index');
const { updateProfile } = require("firebase/auth");
const {
    getDownloadURL,
    uploadBytesResumable,
    ref,
  } = require("firebase/storage");

//edit profile user
exports.updateUserProfile = async (req, res) => {
  const id = auth.currentUser.uid;

  const storageRef = ref(
    storage,
    `profileImage/${req.file ? req.file.originalname : 'defaultFilename'}-${Date.now()}`
  );

  const metadata = { contentType: req.file ? req.file.mimetype : 'image/jpeg' };

  let downloadUrl = auth.currentUser.photoURL;
  if (req.file) {
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    downloadUrl = await getDownloadURL(snapshot.ref);
  }

  const { username } = req.body;
  const UserDoc = db.collection("Users").doc(id);
  const user = await UserDoc.get();
  const response = user.data();

  if (username && !req.file) {
    await UserDoc.update({
      username: username,
      updatedAt: new Date().toISOString(),
    });
  } else if (!username && req.file) {
    await UserDoc.update({
      photoProfile: downloadUrl,
      updatedAt: new Date().toISOString(),
    });
  } else if (username && req.file) {
    await UserDoc.update({
      username: username,
      photoProfile: downloadUrl,
      updatedAt: new Date().toISOString(),
    });
  }

  res.status(200).json([
    {
      createdAt: response.createdAt,
      username: username || response.username,
      email: auth.currentUser.email,
      photoProfile: downloadUrl,
      updatedAt: new Date().toISOString(),
    },
  ]);
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
    try {
        const id = auth.currentUser.uid;
        await db.collection("Users").doc(id).delete();
        await auth.currentUser.delete();
        res.status(200).send({ message: "User berhasil dihapus" });
    } catch (error) {
        res.status(400).send({ message: error });
    }
} 

//get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const id = auth.currentUser.uid;
        const user = await db.collection("Users").doc(id).get();
        const response = user.data();
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({ message: error });
    }
}

//get user profile by id
exports.getUserProfileById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await db.collection("Users").doc(id).get();
        const response = user.data();
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({ message: error });
    }
}