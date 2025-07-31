// =======================
// Firebase Config Global
// =======================

// Configuración de tu app (copiada de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCNimJL5JMo7NNdLLq625q-D04SSHVzj_8",
  authDomain: "factorizate-f9334.firebaseapp.com",
  projectId: "factorizate-f9334",
  storageBucket: "factorizate-f9334.firebasestorage.app",
  messagingSenderId: "1030180633029",
  appId: "1:1030180633029:web:1168aa84bd41046bbd33ac",
  measurementId: "G-V10QTM3Q5Q"
};

// Inicializar Firebase (SDK modular v12 con compatibilidad)
if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

// Variables globales para usar en la app
const auth = firebase.auth();
const db = firebase.firestore();
