import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface TokenStore {
    token: string;
    setToken: (data: string) => void;
    resetToken: () => void;
}

const useTokenStore = create<TokenStore>()(
    persist(
        devtools((set) => ({
            token: '',
            setToken: (data: string) => set({ token: data }),
            resetToken: () => set({ token: '' }),
        })),
        { name: 'token-store' }
    )
);


export default useTokenStore;