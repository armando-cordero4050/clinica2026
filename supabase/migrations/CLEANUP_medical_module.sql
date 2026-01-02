-- =====================================================
-- LIMPIEZA COMPLETA DEL MÓDULO MÉDICO
-- Date: 2026-01-01
-- Author: DentalFlow Team
-- Description: Elimina TODOS los datos de prueba del módulo médico
-- ADVERTENCIA: Esta operación NO se puede deshacer
-- =====================================================

-- IMPORTANTE: Ejecuta este script SOLO si estás seguro de querer eliminar TODOS los datos

-- 1. Eliminar todas las citas (appointments depende de patients, eliminar primero)
DELETE FROM schema_medical.appointments;

-- 2. Eliminar todos los pacientes
DELETE FROM schema_medical.patients;

-- Verificación: Contar registros restantes
SELECT 
    'appointments' as tabla, 
    COUNT(*) as registros 
FROM schema_medical.appointments
UNION ALL
SELECT 
    'patients' as tabla, 
    COUNT(*) as registros 
FROM schema_medical.patients;

-- Mensaje de confirmación
SELECT 'Limpieza completada. Todos los datos del módulo médico han sido eliminados.' as resultado;
