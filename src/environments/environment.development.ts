import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
export const environment = {
  production: false,
   apiUrl: 'https://vitoxyz.com/Backend/api',
   // apiUrl: 'http://localhost:8080/Backend/api',
   // apiUrl: 'https://vitoxyzbackend-az2e.onrender.com/Backend/api',

  apiKey: 'dev_api_key',
  //googleMapsApiKey: 'AIzaSyAL0m-w-jkSFRy7S8aUhjvZI8KOYNZBNCQ',
  googleMapsApiKey: 'AIzaSyBwkoBuGelQUiN2YSN-pqGhNv1KJE8CFNs',
  razorpayKey: 'rzp_test_RARA6BGk8D2Y2o',

  firebase: {
     apiKey: "AIzaSyCXe_uurDqHTnVXipvTCCLjx7wtiCV0flw",
  authDomain: "vitoxyzclient-14684.firebaseapp.com",
  projectId: "vitoxyzclient-14684",
  storageBucket: "vitoxyzclient-14684.firebasestorage.app",
  messagingSenderId: "746882776489",
  appId: "1:746882776489:web:06843f00b4d6ae970698b8",
  measurementId: "G-7TF30KVTR5"
  },
  fcmVapidKey: "BGO5rbCdG438t7Jx5DH87NZ-yLia3Sk0hub8VcLY7EQla5n6vzDlXMQlTT7J6DKaInWySwWO886-VV72r9eoWxQ"


};
