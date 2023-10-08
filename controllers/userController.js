const { auth, firestore, storage } = require('../config/firebaseConfig');
const db = require('../models/index');
const {
    getDownloadURL,
    uploadBytesResumable,
    ref,
    deleteObject,
  } = require("firebase/storage");
  const { deleteUser, signOut } = require("firebase/auth");

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

  res.status(200).json([
    {
      createdAt: response.createdAt,
      username: username || response.username,
      email: auth.currentUser.email,
      photoProfile: downloadUrl || response.photoProfile,
      updatedAt: new Date().toISOString(),
    },
  ]);
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
  const id = auth.currentUser.uid;
  const user = auth.currentUser;
  const userDoc = db.collection("Users").doc(id);
  const users = await userDoc.get();
  const data = users.data();
  const fileUrl = data.photoProfile;
  const storageRefPhotoProfile = ref(storage, fileUrl);
  if (!data) {
    return "Not Found";
  } else if (fileUrl) {
    await deleteObject(storageRefPhotoProfile);
    await userDoc.delete();
    await deleteUser(user).then(() => {
      signOut(auth);
      res.status(200).send({ message: "User Deleted" });
    });
  } else {
    await userDoc.delete();
    await deleteUser(user).then(() => {
      signOut(auth);
      res.status(200).send({ message: "User Deleted" });
    });
  }
};

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