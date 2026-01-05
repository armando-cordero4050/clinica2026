
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase Credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/test_debug.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by statement if needed, but exec_sql usually handles one block.
    // However, our test_debug.sql has multiple SELECTs.
    // exec_sql handles one query string. We should run them separately or as one block?
    // The RPC implementation wraps it in SELECT ... FROM (...) t.
    // If we have multiple statements separated by ;, it might fail wrapping.
    



    // 1. Check Staff (Specific columns to avoid noise)
    console.log(`Checking Staff...`);
    const qStaff = "SELECT id, user_id, clinic_id, role FROM schema_medical.clinic_staff WHERE user_id = '27f173ab-f937-464b-8cea-ceb1abece197'";
    const { data: staff, error: staffError } = await supabase.rpc('exec_sql', { sql_query: qStaff });
    if (staffError) console.error('Staff Check Error:', staffError);
    else console.log('Staff Record:', JSON.stringify(staff, null, 2));

    if (!staff || staff.length === 0) {
        console.error("USER NOT IN STAFF! This is likely the cause.");
        return;
    }
    const clinicId = staff[0].clinic_id;

    // 2. Get Patient
    const qPatient = "SELECT id, first_name FROM schema_medical.patients LIMIT 1";
    const { data: patients } = await supabase.rpc('exec_sql', { sql_query: qPatient });
    const patientId = patients?.[0]?.id;
    console.log('Patient ID:', patientId);

    // 3. Get Service
    const qService = "SELECT id, name FROM schema_lab.services LIMIT 1";
    const { data: services } = await supabase.rpc('exec_sql', { sql_query: qService });
    const serviceId = services?.[0]?.id;
    console.log('Service ID:', serviceId);

    if (!patientId || !serviceId) {
        console.error("Missing prerequisites (patient/service)");
        return;
    }

    // 4. Call RPC Directly
        // Note: We are 'service_role' so 'auth.uid()' is null.
        // BUT we can pass 'p_clinic_id' if we use the SuperAdmin signature?
        // Wait, create_appointment_rpc was updated to accept p_clinic_id!
        // create_appointment_rpc(p_patient_id, p_doctor_id, p_title, p_start, p_end, p_type, p_reason, p_service_id, p_clinic_id)
        
        // We will try to use that signature.
        // If we pass p_clinic_id, it skips auth.uid() check.
        
        // We construct the SQL call string carefully.
        const start = new Date();
        start.setDate(start.getDate() + 1);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
    
        const callRpc = `SELECT public.create_appointment_rpc(
            '${patientId}'::uuid,
            NULL,
            'DEBUG APPOINTMENT 3',
            '${start.toISOString()}'::timestamptz,
            '${end.toISOString()}'::timestamptz,
            'consultation',
            'Debug reason 3',
            '${serviceId}'::uuid,
            '${clinicId}'::uuid
        ) as new_id`;
        
        console.log("Attempting RPC call with explicit clinic_id...");
        const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: callRpc });
        
        if (rpcError) {
            console.error("RPC FAILED:", rpcError);
        } else {
            console.log("RPC SUCCESS. New Appointment ID:", JSON.stringify(rpcResult, null, 2));
        }
}

run();
