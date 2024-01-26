const { auth, firestore, storage } = require('../config/firebaseConfig');
const db = require('../models/index');
const {
    getDownloadURL,
    uploadBytesResumable,
    ref,
    deleteObject,
  } = require("firebase/storage");
const { getAuth } = require('firebase-admin/auth');

//edit profile user
exports.updateUserProfile = async (req, res) => {
  const id = req.user.uid;
  console.log("1");
  console.log(id);
  const storageRef = ref(
    storage,
    `profileImage/${req.file ? req.file.originalname : 'defaultFilename'}-${Date.now()}`
  );
  console.log("2");
  console.log(storageRef);

  const metadata = { contentType: req.file ? req.file.mimetype : 'image/jpeg' };

  console.log("3");
  console.log(metadata);
  // get download url from firebase storage
  const userDB = await db.collection("Users").doc(id).get();
  let downloadUrl = userDB.data().photoProfile;

  if (req.file) {
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    downloadUrl = await getDownloadURL(snapshot.ref);
  }

  const { username } = req.body;
  const UserDoc = db.collection("Users").doc(id);
  const user = await UserDoc.get();
  const response = user.data();

  const updateData = {
    updatedAt: new Date().toISOString(),
  };

  if (username) {
    updateData.username = username;
  }

  if (req.file) {
    updateData.photoProfile = downloadUrl;
  }

  await UserDoc.update(updateData);

  let email = userDB.data().email;

  res.status(200).json([
    {
      createdAt: response.createdAt,
      username: username || response.username,
      email: email,
      photoProfile: downloadUrl || response.photoProfile,
      updatedAt: new Date().toISOString(),
    },
  ]);
};

exports.deleteUserAccount = async (req, res) => {
  const uid = req.user.uid;
  const userDoc = db.collection("Users").doc(uid);
  const users = await userDoc.get();
  const data = users.data();
  const fileUrl = data.photoProfile;

  if (!data) {
    res.status(404).send({ message: "User Not Found" });
  } else {
    try {
      if (fileUrl) {
        const storageRefPhotoProfile = ref(storage, fileUrl);
        await deleteObject(storageRefPhotoProfile);
      }
      await userDoc.delete();
      await getAuth().deleteUser(uid);
      res.status(200).send({ message: "User Deleted" });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  }
};

//get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const id = req.user.uid;
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