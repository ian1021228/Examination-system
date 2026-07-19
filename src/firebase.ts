import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMwOOb0ib_gl5A2cgqw9Lqfrw8D_zJoQM",
  authDomain: "ket-training-9b88d.firebaseapp.com",
  projectId: "ket-training-9b88d",
  storageBucket: "ket-training-9b88d.firebasestorage.app",
  messagingSenderId: "1048640604545",
  appId: "1:1048640604545:web:97763f7dec221ca9eac080"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
