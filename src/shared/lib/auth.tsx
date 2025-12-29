import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase';

export type UserRole = 'admin' | 'clinic_admin' | 'doctor' | 'assistant' | 'lab_admin' | 'lab_tech' | 'logistica';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    clinicId: string | null;
    userRole: UserRole | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    clinicId: null,
    userRole: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch profile details
    const fetchProfile = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('clinic_id, role')
                .eq('id', uid)
                .single();
            
            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }

            if (data) {
                setClinicId(data.clinic_id);
                setUserRole(data.role as UserRole);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        }
    };

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                // If we don't have profile info yet, fetch it
                await fetchProfile(session.user.id); 
            } else {
                // Logout
                setClinicId(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user: session?.user ?? null,
        clinicId,
        userRole,
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
