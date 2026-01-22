// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBOE4zrGUy9RWJwVm3_n2WyktdN5oi0G00",
  authDomain: "nepali-ballot.firebaseapp.com",
  projectId: "nepali-ballot",
  storageBucket: "nepali-ballot.firebasestorage.app",
  messagingSenderId: "924146447243",
  appId: "1:924146447243:web:9ae3ca3d13f3dbfa12f58e",
  measurementId: "G-9RFYPELQKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
