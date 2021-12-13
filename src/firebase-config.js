import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBSBkJ1g9T8icq4YMzOLItdHzGLMe8eucA",
    authDomain: "nftvoting.firebaseapp.com",
    projectId: "nftvoting",
    storageBucket: "nftvoting.appspot.com",
    messagingSenderId: "836782236038",
    appId: "1:836782236038:web:cff93b95ee363e8813cc07",
    measurementId: "G-DQ9VJFP8WD"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);