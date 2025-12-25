import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    clinicId: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    clinicId: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [clinicId, setClinicId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                // In a real scenario, we might fetch the last active clinic from profile or local storage
                // For now, we leave clinicId null until explicitly set or fetched
            }
            setLoading(false);
        });

        // 2. Listen for Auth Changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user: session?.user ?? null,
        clinicId: null, // Placeholder
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useSession = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useSession must be used within an AuthProvider');
    }
    return context;
};
