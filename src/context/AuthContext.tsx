import React, { createContext, useState, useEffect, useContext, useMemo, type ReactNode, useCallback } from 'react';
import api from '../utils/api';

interface User {
    id: string | number;
    username: string;
    email: string;
    role: 'user' | 'admin' | 'instructor' | 'student';
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => ({ success: false }),
    logout: () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on initial load
    useEffect(() => {
        // Check localStorage first (Remember Me), then sessionStorage
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        try {
            setLoading(true);

            const response = await api.post('/users/login', {
                email,
                password
            });

            if (response.data && (response.data as any).token) {
                const { token } = response.data as any;
                const user = (response.data as any).data?.user || (response.data as any).user;

                if (!user) {
                    return { success: false, error: 'Kullanıcı bilgisi alınamadı' };
                }

                if (rememberMe) {
                    // Remember Me aktif: localStorage'a kaydet (kalıcı - tarayıcı kapanınca da kalır)
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);
                    console.log('✅ Beni Hatırla: Aktif - Bilgiler localStorage\'a kaydedildi (kalıcı)');
                } else {
                    // Remember Me pasif: sessionStorage'a kaydet (geçici - tarayıcı kapanınca silinir)
                    sessionStorage.setItem('user', JSON.stringify(user));
                    sessionStorage.setItem('token', token);
                    console.log('ℹ️ Beni Hatırla: Pasif - Bilgiler sessionStorage\'a kaydedildi (geçici)');
                }

                setUser(user);
                setToken(token);

                return { success: true, user };
            }

            return { success: false, error: 'Geçersiz yanıt formatı' };

        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        setUser(null);
        setToken(null);
        // Anasayfaya yönlendir
        window.location.href = '/';
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        logout
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
