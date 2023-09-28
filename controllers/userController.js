const { auth, firestore, storage } = require('../config/firebaseConfig');
const db = require('../models/index');
const {
    getDownloadURL,
    uploadBytesResumable,
    ref,
  } = require("firebase/storage");

//edit profile user
exports.updateUserProfile = async (req) => {
    const id = auth.currentUser.uid;
    const storageRef = ref(
      storage,
      `profileImage/${req.file.originalname}-${Date.now()}`
    );
    const metadata = { contentType: req.file.mimetype };
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    const downloadUrl = await getDownloadURL(snapshot.ref);
    const { username } = req.body;
    const UserDoc = db.collection("User").doc(id);
    const user = await UserDoc.get();
    const response = user.data();
    await updateProfile(auth.currentUser, {
      photoURL: downloadUrl,
    });
    await UserDoc.update({
      createdAt: response.createdAt,
      username: username,
      email: auth.currentUser.email,
      photoProfile: auth.currentUser.photoURL,
      updatedAt: new Date().toISOString(),
    });
    return [
      {
        createdAt: response.createdAt,
        username: username,
        email: auth.currentUser.email,
        photoProfile: auth.currentUser.photoURL,
        updatedAt: new Date().toISOString(),
      },
    ];
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
    try {
        const id = auth.currentUser.uid;
        await db.collection("User").doc(id).delete();
        await auth.currentUser.delete();
        res.status(200).send({ message: "User berhasil dihapus" });
    } catch (error) {
        res.status(400).send({ message: error });
    }
}  