import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface TokenStore {
    token: string;
    setToken: (data: string) => void;
    resetToken: () => void;
    clearToken: () => void;
    getToken: () => string;
}

const useTokenStore = create<TokenStore>()(
    devtools((set, get) => ({
        token: typeof window !== 'undefined' ? Cookies.get('token') || '' : '',

        setToken: (data: string) => {
            set({ token: data });
            // Store in cookie (shared with frontend)
            if (typeof window !== 'undefined') {
                Cookies.set('token', data, {
                    expires: 7, // 7 days
                    path: '/',
                    sameSite: 'lax',
                    secure: import.meta.env.PROD,
                });
            }
        },

        resetToken: () => {
            set({ token: '' });
            if (typeof window !== 'undefined') {
                Cookies.remove('token', { path: '/' });
            }
        },

        clearToken: () => {
            set({ token: '' });
            if (typeof window !== 'undefined') {
                Cookies.remove('token', { path: '/' });
            }
        },

        getToken: () => {
            const state = get();
            if (state.token) return state.token;

            // Fallback to cookie if state is empty
            if (typeof window !== 'undefined') {
                const cookieToken = Cookies.get('token');
                if (cookieToken) {
                    set({ token: cookieToken });
                    return cookieToken;
                }
            }
            return '';
        },
    }))
);

export default useTokenStore;