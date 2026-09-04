import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import api from '../config/api';
import { userLoginSchema } from '../validation/loginValidation';
import { userRegistrationSchema } from '../validation/registerValidation';
import toast from 'react-hot-toast';
interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // ইনিশিয়াল লোড চেক করার জন্য true রাখা ভালো
    
    // অ্যাপ রিলোড হলে ইউজার সেশন চেক করার জন্য (Optionally)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/api/v1/auth/me'); // ব্যাকএন্ডে এমন এন্ডপয়েন্ট থাকলে ডেটা ফেচ হবে
                if (res.data?.data) {
                    setUser(res.data.data);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // ১. লগইন ফাংশন
    const login = async (email: string, password: string) => {
        setLoading(true);
       
        try {
            const validationResult = userLoginSchema.safeParse({ email, password });
            if (!validationResult.success) {
                throw new Error("Invalid email or password format");
            }

            const res = await api.post('/auth/login', { email, password });
            const responseData = res.data;
            setUser(responseData.data)
            // আপনার ApiResponse স্ট্রাকচার অনুযায়ী
            if (responseData.statusCode && responseData.statusCode !== 200) {
                throw new Error(responseData.message || "Login failed");
            }

            setUser(responseData.data);
            if (responseData.meta?.accessToken) {
                setToken(responseData.meta.accessToken);
            }
            toast.success("Login successful");
            navigate('/'); // সফল লগইন হলে রিডাইরেক্ট
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Something went wrong");
            
        } finally {
            setLoading(false);
        }
    };

    // ২. রেজিস্টার ফাংশন
    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        
        try {
            const result = userRegistrationSchema.safeParse({ name, email, password });
            if (!result.success) {
                throw new Error("Invalid registration data");
            }
            const res = await api.post('/auth/register', result.data);
            const responseData = res.data;
            
            if (responseData.statusCode && responseData.statusCode !== 201 && responseData.statusCode !== 200) {
                throw new Error(responseData.message || "Registration failed");
            }

            navigate('/login'); // সফল রেজিস্টার হলে লগইন পেজে পাঠানো
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // ৩. লগআউট ফাংশন
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            setUser(null);
            setToken(null);
            navigate('/login');
        }
    };

    // ৪. ইউজার আপডেট ফাংশন
    const updateUser = (updatedFields: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}