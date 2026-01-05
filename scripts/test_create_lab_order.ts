import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
    console.log("Testing Create Lab Order RPC...");

    // We need a valid clinic_id, patient_id, doctor_id
    // We'll use the ones from diagnose_clinic_staff.ts output if available
    // clinic_id: f3ce19fa-c51e-448f-949a-48550b77a1f2
    // patient_id: edcdb07c-454a-4525-bc08-ac49ddfbe37b
    // doctor_id: 27f173ab-f937-464b-8cea-ceb1abece197 (This is the clinic admin user ID, used as doctor ID for testing?)
    // Note: The params expect UUIDs.

    const clinicId = 'f3ce19fa-c51e-448f-949a-48550b77a1f2'; 
    const patientId = 'edcdb07c-454a-4525-bc08-ac49ddfbe37b';
    const userId = '27f173ab-f937-464b-8cea-ceb1abece197'; 

    // Mock Payload
    const params = {
        p_clinic_id: clinicId,
        p_patient_id: patientId,
        p_doctor_id: userId, // Using user id as doctor
        p_priority: 'normal',
        p_target_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        p_notes: 'TEST ORDER FROM SCRIPT',
        p_items: [
            {
                configuration_id: '4a013b45-74d8-42b3-91fd-4a2013bf5f00', // From logs
                tooth_number: 11,
                color: 'A2',
                unit_price: 150,
                clinical_finding_id: null
            }
        ],
        p_shipping_type: 'pickup',
        p_carrier_name: null,
        p_tracking_number: null,
        p_clinic_lat: null,
        p_clinic_lng: null
    };

    console.log("Calling create_lab_order_transaction_v2 with:", JSON.stringify(params, null, 2));

    const { data: orderId, error: rpcError } = await supabase.rpc('create_lab_order_transaction_v2', params);

    if (rpcError) {
        console.error("RPC FAILED:", rpcError);
    } else {
        console.log("RPC SUCCESS. Order ID:", orderId);
    }
}

run();
