import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgf6DC3gN85UtOvdmp2DjzlWkOtPHSByE",
  authDomain: "parivaar-b9150.firebaseapp.com",
  projectId: "parivaar-b9150",
  storageBucket: "parivaar-b9150.appspot.com",
  messagingSenderId: "365873922261",
  appId: "1:365873922261:web:ca4bb121bd934d4e6d625c",
  measurementId: "G-84W5B4ZN6B",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);

export const firebaseDB = getFirestore(firebaseApp);

export const getFirebaseAppRemoteConfig = () => {
  return getDocs(collection(firebaseDB, "config")).then((snapshot) => {
    const doc = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))?.[0];
    return doc;
  });
};
