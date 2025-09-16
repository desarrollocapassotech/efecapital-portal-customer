import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA6FXXWhtaxY6ocwmdbXNg35zbmJbJCNfc",
  authDomain: "efecapitalportal.firebaseapp.com",
  projectId: "efecapitalportal",
  storageBucket: "efecapitalportal.firebasestorage.app",
  messagingSenderId: "788811289194",
  appId: "1:788811289194:web:ca7f75d58be92fae4b7013",
  measurementId: "G-RJLP7WJPK2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
