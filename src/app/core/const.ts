export const API_URL = 'https://vitoxyzbackend-27e9.onrender.com';
// export const API_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
    LOGIN: '/user/loginWithPasswordUser',
    SIGNUP: '/user/signup',
    USER_PROFILE: '/user/profile',
    BOOK_STAFF: '/user/create-booking',
    CATEGORIES: '/api/categories',
    SUB_CATEGORIES: '/subcategories',
    SIGN_UP: '/user/signup',
    SEND_OTP: '/user/otp',
    VERIFY_OTP: '/user/verify-otp',
    LOGIN_EMAIL: '/user/loginWithEmail',

    // On board to diet plan
    ONBOARD_DIET: '/user/onboard-diet',
    BOOKING_RESPONSE: '/user/booking-response',
    SUBSCRIPTION_PLANS: '/plans',
    REMOVE_STAFF: '/user/remove-staff/{bookingId}',
    BOOK_SINGLE_STAFF:'/user/create-booking',

    
}
