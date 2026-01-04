# Guía de Conexión Odoo (Escenario Docker)

Este documento detalla la configuración y el estado de la conexión con Odoo ERP corriendo localmente mediante Docker.

---

## 1. Detalles de Conexión (Actuales)

Actualmente, el sistema está configurado para comunicarse con un contenedor local de Odoo:

- **Host (Local):** `http://localhost:8069`
- **Base de Datos:** `clinica-test`
- **Usuario:** `jhernandez@smartnetgt.com`
- **API Key / Password:** `Guate502#`

> **Nota:** Al usar Docker, asegúrate de que el contenedor de Odoo esté arriba y que el puerto `8069` esté correctamente mapeado.

---

## 2. Dónde se guarda esta información

DentalFlow maneja una arquitectura de redundancia para estas credenciales:

1.  **Base de Datos (Prioridad 1):** Guardada en la tabla `schema_core.odoo_config`. El sistema siempre intentará leer de aquí primero.
2.  **Variables de Entorno (Prioridad 2):** Si no hay una configuración activa en la DB, buscará en el archivo `.env`:
    - `ODOO_URL=http://localhost:8069`
    - `ODOO_DB=clinica-test`
    - `ODOO_USERNAME=jhernandez@smartnetgt.com`
    - `ODOO_PASSWORD=Guate502#`

---

## 3. Comandos de Verificación

Si tienes dudas sobre el estado de la conexión, puedes usar estos comandos desde la terminal del proyecto:

### Probar conexión básica
```powershell
# Este comando usa la lógica del módulo core para validar el handshake XML-RPC
npx tsx scripts/db-executor-rpc.ts query "SELECT version()"
```

### Ver configuración activa en DB
```powershell
npx tsx scripts/db-executor-rpc.ts query "SELECT * FROM schema_core.odoo_config WHERE is_active = true"
```

---

## 4. Troubleshooting Docker

Si el sistema reporta error de conexión (`ECONNREFUSED`):

1.  **Verifica el contenedor:** `docker ps` para ver si el servicio `odoo` está `Up`.
2.  **Red Compartida:** Si ejecutas DentalFlow dentro de otro contenedor, usa el nombre del servicio (ej: `http://odoo:8069`) en lugar de `localhost`.
3.  **Logs de Odoo:** Revisa `docker logs -f <nombre_contenedor_odoo>` para ver errores de autenticación o base de datos.

---

## 5. Limpieza de Datos (Reset)

Para vaciar los datos sincronizados en DentalFlow pero **no en Odoo**, usa el script maestro de reset:
```powershell
npx tsx scripts/db-executor-rpc.ts file RESET_DATA_V5.sql
```

Para borrar datos dentro de Odoo, se debe usar el panel administrativo de Odoo o un script XML-RPC específico para unlink (borrado).
