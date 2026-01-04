# Guía: Obtener Google Maps API Key

**Fecha**: 2026-01-02  
**Propósito**: Configurar Google Maps para módulo de logística

---

## 📋 Paso a Paso

### 1. Crear Proyecto en Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Click en el selector de proyectos (arriba a la izquierda)
4. Click en "Nuevo Proyecto"
5. Nombre del proyecto: `DentalFlow-Production`
6. Click en "Crear"

---

### 2. Habilitar APIs Necesarias

1. En el menú lateral, ve a **APIs y servicios** → **Biblioteca**
2. Busca y habilita las siguientes APIs (una por una):

   ✅ **Maps JavaScript API**
   - Para mostrar mapas interactivos en el navegador
   
   ✅ **Geocoding API**
   - Para convertir direcciones a coordenadas (lat/lng)
   
   ✅ **Distance Matrix API**
   - Para calcular distancias y tiempos entre puntos
   
   ✅ **Directions API**
   - Para generar rutas entre puntos
   
   ✅ **Routes API** (Opcional, para optimización avanzada)
   - Para optimización de waypoints con IA

3. Para cada API:
   - Click en la API
   - Click en "Habilitar"
   - Espera a que se active

---

### 3. Crear API Keys

#### 3.1 API Key para Cliente (Frontend)

1. Ve a **APIs y servicios** → **Credenciales**
2. Click en "+ CREAR CREDENCIALES"
3. Selecciona "Clave de API"
4. Se creará una clave, cópiala temporalmente
5. Click en el nombre de la clave para editarla
6. Configura:
   - **Nombre**: `DentalFlow-Client-Key`
   - **Restricción de aplicación**: Sitios web HTTP
   - **Restricciones de sitios web**:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - `https://tudominio.com/*` (cuando tengas dominio)
   - **Restricción de API**: Selecciona solo:
     - Maps JavaScript API
     - Geocoding API
7. Click en "Guardar"

#### 3.2 API Key para Servidor (Backend)

1. Click en "+ CREAR CREDENCIALES" nuevamente
2. Selecciona "Clave de API"
3. Click en el nombre de la clave para editarla
4. Configura:
   - **Nombre**: `DentalFlow-Server-Key`
   - **Restricción de aplicación**: Direcciones IP
   - **Restricciones de IP**: 
     - `0.0.0.0/0` (para desarrollo)
     - Tu IP de servidor (para producción)
   - **Restricción de API**: Selecciona solo:
     - Distance Matrix API
     - Directions API
     - Routes API
     - Geocoding API
5. Click en "Guardar"

---

### 4. Configurar Facturación

⚠️ **IMPORTANTE**: Google Maps requiere una cuenta de facturación, pero ofrece $200 USD de crédito gratis cada mes.

1. Ve a **Facturación** en el menú lateral
2. Click en "Vincular una cuenta de facturación"
3. Sigue los pasos para agregar una tarjeta de crédito
4. No te preocupes, no te cobrarán a menos que excedas los $200/mes

**Uso estimado para DentalFlow**:
- Maps JavaScript API: ~$7 por 1000 cargas de mapa
- Distance Matrix API: ~$5 por 1000 requests
- Directions API: ~$5 por 1000 requests
- Routes API: ~$10 por 1000 optimizaciones

**Estimación mensual**: ~$20-50 USD (bien dentro del crédito gratuito)

---

### 5. Agregar Keys al Proyecto

1. Abre el archivo `.env` en la raíz del proyecto
2. Agrega las siguientes líneas:

```env
# Google Maps API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_client_key_aqui
GOOGLE_MAPS_SERVER_API_KEY=tu_server_key_aqui
```

3. **NO SUBAS ESTAS KEYS A GITHUB**
4. Verifica que `.env` esté en `.gitignore`

---

### 6. Verificar que Funciona

1. Reinicia el servidor de desarrollo
2. Abre la consola del navegador (F12)
3. Ejecuta:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
   ```
4. Deberías ver tu API key

---

## 🔒 Seguridad

### Buenas Prácticas

1. ✅ **Nunca** compartas tus API keys públicamente
2. ✅ **Siempre** usa restricciones de dominio/IP
3. ✅ **Monitorea** el uso en Google Cloud Console
4. ✅ **Rota** las keys periódicamente
5. ✅ **Usa** keys diferentes para dev y producción

### Alertas de Uso

1. Ve a **APIs y servicios** → **Panel**
2. Configura alertas de cuota
3. Recibe emails si el uso excede el 80% del crédito

---

## 📊 Monitoreo

### Ver Uso de APIs

1. Ve a **APIs y servicios** → **Panel**
2. Selecciona el rango de fechas
3. Revisa:
   - Requests por API
   - Errores
   - Latencia

### Cuotas y Límites

1. Ve a **APIs y servicios** → **Cuotas**
2. Revisa límites por API
3. Puedes solicitar aumento si es necesario

---

## ❓ Troubleshooting

### Error: "This API project is not authorized to use this API"
**Solución**: Verifica que la API esté habilitada en el proyecto

### Error: "The provided API key is invalid"
**Solución**: Verifica que la key esté correcta en `.env` y reinicia el servidor

### Error: "This IP, site or mobile application is not authorized"
**Solución**: Agrega tu dominio/IP a las restricciones de la key

### Error: "You have exceeded your daily request quota"
**Solución**: Espera 24 horas o aumenta la cuota en Google Cloud Console

---

## 📞 Soporte

- Documentación oficial: https://developers.google.com/maps/documentation
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-maps
- Soporte de Google Cloud: https://cloud.google.com/support

---

**Fin del Documento**
