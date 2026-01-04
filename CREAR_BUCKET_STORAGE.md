# INSTRUCCIONES: Crear Bucket de Supabase Storage

## Paso 1: Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión
3. Selecciona tu proyecto: `uadurfgrkjjbexnpcjdq`

## Paso 2: Crear el Bucket

1. En el menú lateral, click en **Storage**
2. Click en "**Create a new bucket**" (botón verde)
3. Completa:
   - **Name**: `lab-files`
   - **Public bucket**: ✅ **ACTIVADO** (toggle ON)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: Dejar vacío (permite todos)
4. Click en "**Create bucket**"

## Paso 3: Configurar Políticas (Opcional)

Las políticas RLS se crean automáticamente para buckets públicos, pero si quieres personalizarlas:

1. Click en el bucket `lab-files`
2. Ve a la pestaña "**Policies**"
3. Verifica que existan:
   - ✅ Policy para INSERT (authenticated users)
   - ✅ Policy para SELECT (public)

## Paso 4: Verificar

1. En el bucket `lab-files`, intenta subir un archivo de prueba
2. Si se sube correctamente, ¡está listo!

---

**Cuando hayas creado el bucket, avísame para continuar con las pruebas del Sprint 1.** 🚀
