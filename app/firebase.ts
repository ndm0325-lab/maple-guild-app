import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "네 firebase api키",
  authDomain: "maple-guild-app.firebaseapp.com",
  projectId: "maple-guild-app",
  storageBucket: "maple-guild-app.firebasestorage.app",
  messagingSenderId: "592347589298",
  appId: "1:592347589298:web:어쩌구",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
};