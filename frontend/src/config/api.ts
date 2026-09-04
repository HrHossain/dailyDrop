import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    error => {
        // শুধুমাত্র তখনই রিডাইরেক্ট করবে যদি রেসপন্স 401 হয় 
        // এবং ইউজার ইতিমধ্যে '/login' পেজে না থাকে
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            
            // যদি হোম পেজ বা পাবলিক পেজ হয়, তবে জোর করে লগইন পেজে পাঠাবেন না
            // শুধুমাত্র প্রটেক্টেড পেজে থাকলেই রিডাইরেক্ট করুন
            if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;