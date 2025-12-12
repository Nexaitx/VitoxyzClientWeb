import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
export const environment = {
  production: false,
   apiUrl: 'https://vitoxyz.com/api',
    //apiUrl: 'http://localhost:8080/api',


  apiKey: 'dev_api_key',
  googleMapsApiKey: 'AIzaSyAL0m-w-jkSFRy7S8aUhjvZI8KOYNZBNCQ',
  razorpayKey: 'rzp_test_RARA6BGk8D2Y2o',

  firebase: {
     apiKey: "AIzaSyDujboFt_5CS8y1EH7EN5Kzdof0cZbnXaw",
  authDomain: "vitoxyzclientweb.firebaseapp.com",
  projectId: "vitoxyzclientweb",
  storageBucket: "vitoxyzclientweb.firebasestorage.app",
  messagingSenderId: "675568857186",
  appId: "1:675568857186:web:0a1f84cec64e7f8f0be13b",
  measurementId: "G-RHC0Z5V6Q4"
  },
  fcmVapidKey: "BIkNaPgHdFkb5Mts_4tNPTsb437UYTjM2rB6EcdVq8Mzud1CGk273e7s7ngTpVm5Wn3Z08rxw1Bk5h5P5EEBj_w"


};
