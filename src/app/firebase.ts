import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAtILdRQq78yFuktt6eHSdcLt66sEqfr0A",
  authDomain: "todo-app-cbbb3.firebaseapp.com",
  projectId: "todo-app-cbbb3",
  storageBucket: "todo-app-cbbb3.firebasestorage.app",
  messagingSenderId: "304351118000",
  appId: "1:304351118000:web:444dbc8344344222a0f175"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
