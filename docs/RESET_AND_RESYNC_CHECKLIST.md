# 🔄 Proceso de Reset y Resincronización Completa

## ✅ Checklist de Ejecución

### Fase 1: Reset de Base de Datos

- [ ] **1.1** Abrir Supabase SQL Editor
- [ ] **1.2** Ejecutar `scripts/reset-database-complete.sql` completo
- [ ] **1.3** Verificar que la tabla de verificación muestra:
  - `users`: 1 o 0
  - Todas las demás: 0

### Fase 2: Verificar Odoo

- [ ] **2.1** Abrir Odoo: http://localhost:8069
- [ ] **2.2** Ir a Contactos
- [ ] **2.3** Verificar que existe "Clinica Sonrisas 2026"
- [ ] **2.4** Verificar que tiene contactos asociados (Dr. Pedro, etc.)
- [ ] **2.5** Anotar el ID del partner de Odoo

### Fase 3: Sincronizar desde DentalFlow

- [ ] **3.1** Ir a http://localhost:3000
- [ ] **3.2** Login como super_admin (si existe) o crear nuevo usuario admin
- [ ] **3.3** Ir a Settings → Odoo Integration
- [ ] **3.4** Verificar configuración de Odoo:
  - URL: http://localhost:8069
  - Database: (nombre de tu DB)
  - Username: admin
  - API Key: (tu password de Odoo)
- [ ] **3.5** Click en "Sync Clinics from Odoo"
- [ ] **3.6** Esperar mensaje de éxito

### Fase 4: Verificar Sincronización

- [ ] **4.1** Ejecutar en Supabase:
```sql
-- Ver clínicas sincronizadas
SELECT id, name, odoo_partner_id, email 
FROM schema_medical.clinics;

-- Ver staff sincronizado
SELECT 
    cs.id,
    cs.role,
    cs.title,
    cs.job_position,
    u.email,
    u.name,
    c.name as clinic_name
FROM schema_medical.clinic_staff cs
JOIN schema_core.users u ON u.id = cs.user_id
JOIN schema_medical.clinics c ON c.id = cs.clinic_id
ORDER BY c.name, cs.is_primary DESC;
```

- [ ] **4.2** Verificar que aparecen:
  - Clinica Sonrisas 2026
  - Dr. Pedro como contacto
  - Email correcto

### Fase 5: Activar Usuario y Probar Login

- [ ] **5.1** Resetear password del Dr. Pedro:
```sql
SELECT reset_clinic_staff_password(
  (SELECT id FROM schema_core.users WHERE email = 'drpedro@clinica.com'),
  'Test123!'
);
```

- [ ] **5.2** Logout de DentalFlow
- [ ] **5.3** Login con:
  - Email: drpedro@clinica.com
  - Password: Test123!

- [ ] **5.4** Verificar que:
  - Login exitoso
  - NO aparece "No se encontró clínica"
  - Aparece "Clinica Sonrisas 2026"
  - Puede navegar a Pacientes

### Fase 6: Prueba Final del Módulo de Clínica

- [ ] **6.1** Ir a /dashboard/medical/patients
- [ ] **6.2** Verificar que se ve:
  - Estadísticas de pacientes
  - Botón "Nuevo Paciente"
  - Tabla vacía (sin errores)

- [ ] **6.3** Abrir consola del navegador (F12)
- [ ] **6.4** Verificar logs:
  - "Fetching clinic for user: [uuid]"
  - "Clinic staff record: { clinic_id: ... }"
  - "Clinic record: { name: 'Clinica Sonrisas 2026' }"

- [ ] **6.5** NO debe haber errores rojos en consola

---

## 🎯 Resultado Esperado Final

✅ Base de datos limpia
✅ Clínica sincronizada desde Odoo
✅ Dr. Pedro puede hacer login
✅ Dashboard de pacientes funciona
✅ Sin errores de "clínica no encontrada"

---

## 🚨 Si Algo Falla

### Error: "No clinic found for user"
- Verificar que existe registro en `clinic_staff` para el usuario
- Verificar políticas RLS con:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'clinic_staff' 
AND schemaname = 'schema_medical';
```

### Error: "Invalid credentials"
- Verificar que el usuario existe en `auth.users`
- Resetear password nuevamente

### Error: Sincronización falla
- Verificar conexión a Odoo
- Verificar que la clínica tiene email en Odoo
- Revisar logs en `schema_odoo.sync_log`

---

**Tiempo estimado total:** 10-15 minutos
**Última actualización:** 2025-12-30 22:43
