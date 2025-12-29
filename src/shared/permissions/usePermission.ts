import { useSession } from "@/shared/lib/auth";

// TODO: In the real implementation, this should fetch granular permissions from 
// an API endpoint or a cached view/RPC based on the user's role in the active clinic.

export type PermissionCode =
    | 'patients.view'
    | 'patients.create'
    | 'patients.edit'
    | 'patients.delete'
    | 'clinic_members.manage';

export function usePermission(_code: PermissionCode): boolean {
    const { session, clinicId } = useSession();

    // Guard: No authentication or no active clinic context
    if (!session || !clinicId) return false;

    // MOCK IMPLEMENTATION FOR PR #6 UI DEVELOPMENT
    // In a real scenario, we would use a Query to fetch `check_permission` result
    // or decode a JWT claim if permissions are packed there.

    // For now, let's assume if there is a session, we have access (Development Mode)
    // UNLESS explicitly blocked.
    // TO BE REPLACED WITH REAL RPC CALL check_permission(code, clinicId)

    return true;
}

export function usePermissions(codes: PermissionCode[]): Record<PermissionCode, boolean> {
    const results = {} as Record<PermissionCode, boolean>;
    codes.forEach(code => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        results[code] = usePermission(code);
    });
    return results;
}
