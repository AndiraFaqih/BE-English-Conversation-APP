// const { auth, firestore, storage } = require('../config/firebaseConfig');
// const db = require('../models/index');
// const {
//     getDownloadURL,
//     uploadBytesResumable,
//     ref,
//     deleteObject,
//   } = require("firebase/storage");
// const { getAuth } = require('firebase-admin/auth');

// //edit profile user
// exports.updateUserProfile = async (req, res) => {
//   const id = req.uid;
//   console.log("1");
//   console.log(id);
//   const storageRef = ref(
//     storage,
//     `profileImage/${req.file ? req.file.originalname : 'defaultFilename'}-${Date.now()}`
//   );
//   console.log("2");
//   console.log(storageRef);

//   const metadata = { contentType: req.file ? req.file.mimetype : 'image/jpeg' };

//   console.log("3");
//   console.log(metadata);
//   // get download url from firebase storage
//   const userDB = await db.collection("Users").doc(id).get();
//   let downloadUrl = userDB.data().photoProfile;

//   if (req.file) {
//     const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
//     downloadUrl = await getDownloadURL(snapshot.ref);
//   }

//   const { username } = req.body;
//   const UserDoc = db.collection("Users").doc(id);
//   const user = await UserDoc.get();
//   const response = user.data();

//   const updateData = {
//     updatedAt: new Date().toISOString(),
//   };

//   if (username) {
//     updateData.username = username;
//   }

//   if (req.file) {
//     updateData.photoProfile = downloadUrl;
//   }

//   await UserDoc.update(updateData);

//   let email = userDB.data().email;

//   res.status(200).json([
//     {
//       createdAt: response.createdAt,
//       username: username || response.username,
//       email: email,
//       photoProfile: downloadUrl || response.photoProfile,
//       updatedAt: new Date().toISOString(),
//     },
//   ]);
// };

// exports.deleteUserAccount = async (req, res) => {
//   const uid = req.uid;
//   const userDoc = db.collection("Users").doc(uid);
//   const users = await userDoc.get();
//   const data = users.data();
//   const fileUrl = data.photoProfile;

//   if (!data) {
//     res.status(404).send({ message: "User Not Found" });
//   } else {
//     try {
//       if (fileUrl) {
//         const storageRefPhotoProfile = ref(storage, fileUrl);
//         await deleteObject(storageRefPhotoProfile);
//       }
//       await userDoc.delete();
//       await getAuth().deleteUser(uid);
//       res.status(200).send({ message: "User Deleted" });
//     } catch (error) {
//       res.status(500).send({ message: error });
//     }
//   }
// };

// //get user profile
// exports.getUserProfile = async (req, res) => {
//     try {
//         const id = req.uid ;
//         const user = await db.collection("Users").doc(id).get();
//         const response = user.data();
//         res.status(200).send(response);
//     } catch (error) {
//         res.status(400).send({ message: error });
//     }
// }

// //get user profile by id
// exports.getUserProfileById = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const user = await db.collection("Users").doc(id).get();
//         const response = user.data();
//         res.status(200).send(response);
//     } catch (error) {
//         res.status(400).send({ message: error });
//     }
// }

// exports.changePassword = async (req, res) => {
//   const id = req.uid; 
//   const { oldPassword, newPassword, confirmPassword } = req.body; 

//   try {
//       // Update password pengguna dengan Firebase Admin SDK
//       await getAuth().updateUser(id, { password: newPassword });

//       res.status(200).send({ message: "Password updated successfully" });
//   } catch (error) {
//       console.error('Error updating password:', error);
//       res.status(500).send({ message: "An error occurred while updating the password" });
//   }
// };

const { auth, firestore, storage } = require('../config/firebaseConfig');

const FirebaseAdmin = require('../models/index');
const db = FirebaseAdmin.getFirestore();

const {
    getDownloadURL,
    uploadBytesResumable,
    ref,
    deleteObject,
} = require("firebase/storage");
const { getAuth } = require('firebase-admin/auth');
const admin = require("firebase-admin");

class UserController {
  static async updateUserProfile(req, res) {
    const id = req.uid;
    const storageRef = ref(
        storage,
        `profileImage/${req.file ? req.file.originalname : 'defaultFilename'}-${Date.now()}`
    );

    const metadata = { contentType: req.file ? req.file.mimetype : 'image/jpeg' };

    // get download url from firebase storage
    let downloadUrl = null;
    if (req.file) {
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        downloadUrl = await getDownloadURL(snapshot.ref);
    }

    const { username } = req.body;

    const updateData = {};
    if (username) {
        updateData.displayName = username;
    }
    if (req.file) {
        updateData.photoURL = downloadUrl;
    }

    const user = await getAuth().getUser(id);

    try {
        await getAuth().updateUser(id, updateData);
        res.status(200).json({
            message: "User profile updated successfully",
            user: {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            },
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Failed to update user profile" });
    }
}

    // static async updateUserProfile(req, res) {
    //     const id = req.uid;
    //     const storageRef = ref(
    //         storage,
    //         `profileImage/${req.file ? req.file.originalname : 'defaultFilename'}-${Date.now()}`
    //     );

    //     const metadata = { contentType: req.file ? req.file.mimetype : 'image/jpeg' };

    //     // get download url from firebase storage
    //     const userDB = await db.collection("Users").doc(id).get();
    //     let downloadUrl = userDB.data().photoProfile;

    //     if (req.file) {
    //         const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    //         downloadUrl = await getDownloadURL(snapshot.ref);
    //     }

    //     const { username } = req.body;
    //     const UserDoc = db.collection("Users").doc(id);
    //     const user = await UserDoc.get();
    //     const response = user.data();

    //     const updateData = {
    //         updatedAt: new Date().toISOString(),
    //     };

    //     if (username) {
    //         updateData.username = username;
    //     }

    //     if (req.file) {
    //         updateData.photoProfile = downloadUrl;
    //     }

    //     await UserDoc.update(updateData);

    //     let email = userDB.data().email;

    //     res.status(200).json([
    //         {
    //             createdAt: response.createdAt,
    //             username: username || response.username,
    //             email: email,
    //             photoProfile: downloadUrl || response.photoProfile,
    //             updatedAt: new Date().toISOString(),
    //         },
    //     ]);
    // }

static async deleteUserAccount(req, res) {
    const uid = req.uid;
    try {
        const chatRoomsSnapshot = await db.collection('ChatRooms')
            .where('idUser', '==', uid)
            .get();

        const deletePromises = chatRoomsSnapshot.docs.map(async (doc) => {
            const chatRoomId = doc.id;

            const messagesSnapshot = await db.collection('Message')
                .where('chatRoomId', '==', chatRoomId)
                .get();
                
            const deleteMessagePromises = messagesSnapshot.docs.map(async (messageDoc) => {
                await db.collection('Message').doc(messageDoc.id).delete();
            });
            await Promise.all(deleteMessagePromises);

            const AIMessagesSnapshot = await db.collection('AIMessage')
                .where('chatRoomId', '==', chatRoomId)
                .get();

            const deleteAIMessagePromises = AIMessagesSnapshot.docs.map(async (AIMessageDoc) => {
                await db.collection('AIMessage').doc(AIMessageDoc.id).delete();
            });
            await Promise.all(deleteAIMessagePromises);

            await db.collection('ChatRooms').doc(chatRoomId).delete();
        });

        await Promise.all(deletePromises);

        const userData = await getAuth().getUser(uid);
        if (userData) {
            const fileUrl = userData.photoURL;
            if (fileUrl) {
                const storageRefPhotoProfile = ref(storage, fileUrl);
                await deleteObject(storageRefPhotoProfile);
            }
        }
        await getAuth().deleteUser(uid);

        res.status(200).send({ message: "User account deleted successfully" });
    } catch (error) {
        console.error("Error deleting user account:", error);
        res.status(500).send({ message: "Failed to delete user account" });
    }
}

    static async getUserProfile(req, res) {
      const uid = req.uid; // UID pengguna diambil dari middleware autentikasi
      try {
          const userRecord = await admin.auth().getUser(uid);
          const response = {
              uid: userRecord.uid,
              email: userRecord.email,
              displayName: userRecord.displayName,
              photoURL: userRecord.photoURL,
          };
          res.status(200).send(response);
      } catch (error) {
          console.error("Error fetching user data:", error);
          res.status(400).send({ message: "Unable to fetch user data", error: error.message });
      }
  }

    static async getUserProfileById(req, res) {
        try {
            const id = req.params.id;
            const user = await db.collection("Users").doc(id).get();
            const response = user.data();
            res.status(200).send(response);
        } catch (error) {
            res.status(400).send({ message: error });
        }
    }

    static async changePassword(req, res) {
        const id = req.uid; 
        const { oldPassword, newPassword, confirmPassword } = req.body; 

        try {
            // Update password pengguna dengan Firebase Admin SDK
            await getAuth().updateUser(id, { password: newPassword });

            res.status(200).send({ message: "Password updated successfully" });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).send({ message: "An error occurred while updating the password" });
        }
    }
}

module.exports = UserController;