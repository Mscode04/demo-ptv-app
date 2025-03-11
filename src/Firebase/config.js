// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxPIrwvFUU-2Cayh_C_ROC6ipRU_tqU9U",
  authDomain: "palliative-app-10572.firebaseapp.com",
  projectId: "palliative-app-10572",
  storageBucket: "palliative-app-10572.firebasestorage.app",
  messagingSenderId: "881815533939",
  appId: "1:881815533939:web:c4d123ef491a87d0966d06",
  measurementId: "G-633L797DCK"
};

const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
