// export const API_URL = 'https://vitoxyzbackend-27e9.onrender.com/api';

// export const API_URL = 'https://vitoxyz.com/Backend/api';

export const API_URL = `https://vitoxyzbackend-az2e.onrender.com/api`;

 
export const ENDPOINTS = {
    LOGIN: '/user/loginWithPasswordUser',
    SIGN_UP: '/user/signup',
    USER_PROFILE: '/user/profile',
    BOOK_STAFF: '/user/create-booking',
    CATEGORIES: '/categories',
    SUB_CATEGORIES: '/subcategories',
    SEND_OTP: '/user/otp',
    VERIFY_OTP: '/user/verify-otp',
    VERIFY_OTP_LOGIN: '/user/verifyOtpLogin',
    SEND_OTP_LOGIN: '/user/sendOtpLogin',
FORGOT_PASSWORD:'/user/email/forgot-password',
RESET_PASSWORD:'/user/reset-password',
    
    LOGIN_EMAIL: '/user/loginWithEmail',

    // On board to diet plan
    ONBOARD_DIET: '/user/diet/onboard-diet',
    BOOKING_RESPONSE: '/user/booking-response',
    SUBSCRIPTION_PLANS: '/user/subscription/plans',
    REMOVE_STAFF: '/user/remove-staff/{bookingId}',
    BOOK_SINGLE_STAFF:'/user/create-booking',
    UPDATE_PROFILE : '/user/update-profile',

    
}
