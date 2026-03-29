import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "quiz-buzzer-902a6.firebaseapp.com",
  databaseURL: "https://quiz-buzzer-902a6-default-rtdb.firebaseio.com", // 🔥 MUST BE PRESENT
  projectId: "quiz-buzzer-902a6",
  storageBucket: "quiz-buzzer-902a6.appspot.com",
  messagingSenderId: "938248692251",
  appId: "1:938248692251:web:0a35d7b3124c3b63cccebe"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);