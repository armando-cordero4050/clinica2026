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

async function createTestOrder() {
    console.log("🧪 Creando orden de laboratorio de prueba...\n");

    // IDs conocidos del sistema (de sesiones anteriores)
    const clinicId = '27f173ab-f937-464b-8cea-ceb1abece197';
    const patientId = 'edcdb07c-454a-4525-bc08-ac49ddfbe37b';
    const doctorId = '0b8189a5-caa6-4eed-ab65-87e827a8c4dd';
    const configurationId = '4a013b45-74d8-42b3-91fd-4a2013bf5f00'; // ID verificado que existe

    const orderPayload = {
        p_clinic_id: clinicId,
        p_patient_id: patientId,
        p_doctor_id: doctorId,
        p_items: [
            {
                configuration_id: configurationId,
                tooth_number: 11,
                quantity: 1,
                color: 'A2',
                notes: 'Orden de prueba - Verificación E2E'
            }
        ],
        p_shipping_type: 'pickup',
        p_carrier_name: null,
        p_tracking_number: null,
        p_clinic_lat: null,
        p_clinic_lng: null
    };

    console.log("📦 Payload de la orden:");
    console.log(JSON.stringify(orderPayload, null, 2));
    console.log("\n🔄 Llamando a create_lab_order_transaction_v2...\n");

    const { data: orderId, error } = await supabase.rpc('create_lab_order_transaction_v2', orderPayload);

    if (error) {
        console.error("❌ ERROR al crear orden:");
        console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    }

    console.log("✅ ORDEN CREADA EXITOSAMENTE!");
    console.log(`📋 Order ID: ${orderId}`);
    console.log("\n🔍 Verificando orden en la base de datos...\n");

    // Verificar que la orden existe
    const { data: orderData, error: fetchError } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error("❌ Error al verificar orden:", fetchError);
    } else {
        console.log("✅ Orden verificada en schema_lab.lab_orders:");
        console.log(`   - ID: ${orderData.id}`);
        console.log(`   - Clínica: ${orderData.clinic_id}`);
        console.log(`   - Paciente: ${orderData.patient_id}`);
        console.log(`   - Estado: ${orderData.status}`);
        console.log(`   - Fecha entrega: ${orderData.delivery_date}`);
    }

    // Verificar items
    const { data: items, error: itemsError } = await supabase
        .from('lab_order_items')
        .select('*')
        .eq('order_id', orderId);

    if (itemsError) {
        console.error("❌ Error al verificar items:", itemsError);
    } else {
        console.log(`\n✅ Items de la orden (${items.length}):`);
        items.forEach((item, idx) => {
            console.log(`   ${idx + 1}. Config ID: ${item.configuration_id}, Diente: ${item.tooth_number}, Color: ${item.color}`);
        });
    }

    console.log("\n🎯 PRÓXIMO PASO:");
    console.log("   Abre el navegador en http://localhost:3000/dashboard/lab/kamba");
    console.log("   y verifica que la orden aparezca en la columna 'clinic_pending'");
    console.log(`\n   Busca la orden con ID: ${orderId}`);
}

createTestOrder();
