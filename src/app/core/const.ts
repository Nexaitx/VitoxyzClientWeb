export const API_URL = 'http://localhost:8080/api';

  // export const API_URL = "https://vitoxyz.com/Backend/api";
  // export const API_URL = "https://vitoxyzbackend.onrender.com/api"
// export const API_URL = 'https://398ff2efa7fa.ngrok-free.app/api';

 //export const API_URL = `https://vitoxyzbackend-az2e.onrender.com/api`;

export const ENDPOINTS = {
  LOGIN: "/user/loginWithPasswordUser",
  SIGN_UP: "/user/signup",
  USER_PROFILE: "/user/profile",
  BOOK_STAFF: "/booking/staff/complex-booking",
  CATEGORIES: "/categories",
  SUB_CATEGORIES: "/subcategories",
  SEND_OTP: "/user/otp",
  VERIFY_OTP: "/user/verify-otp",
  VERIFY_OTP_LOGIN: "/user/verifyOtpLogin",
  SEND_OTP_LOGIN: "/user/sendOtpLogin",
  FORGOT_PASSWORD: "/user/email/forgot-password",
  RESET_PASSWORD: "/user/reset-password",

  LOGIN_EMAIL: "/user/loginWithEmail",

  MEDICINES: "/medicines/getMedicine",

  MEDICINE_BY_ID: (id: string) => `/medicines/${id}`,
  OTC_MEDICINE_BY_ID: (id: string) => `/products/${id}`,
  OTC_MEDICINES: "/products",
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
PRESCRIPTION:"/prescriptions/upload-without-medicine",
  // On board to diet plan
  ONBOARD_DIET: "/user/diet/onboard-diet",
  // BOOKING_RESPONSE: "/user/booking-response",user/accepted
BOOKING_RESPONSE: "/user/accepted",
  SUBSCRIPTION_PLANS: "/user/subscription/plans",
   PURCHASE_SUBSCRIPTION:"/subscriptions/purchase",
  REMOVE_STAFF: "/user/remove-staff/{bookingId}",
  BOOK_SINGLE_STAFF: "/user/complex-booking",
  UPDATE_PROFILE: "/user/update-profile",
  // PRODUCT_FILTER: "/products/filter",
  // PRODUCT_FILTER_MULTIPLE: "/products/filter/multiple-forms",
  PRODUCT_FILTER: "/otc-products/form",
  PRODUCT_FILTER_MULTIPLE: "/otc-products/by-forms",
  SUBSCRIBEAPI:"/subscribe",
  DIET_DASHBOARD:"/user/active/my-all-dietplans",
};
