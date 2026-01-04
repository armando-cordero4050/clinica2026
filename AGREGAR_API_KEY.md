# INSTRUCCIONES: Agregar Google Maps API Key

## Paso 1: Abrir el archivo .env

1. Abre el archivo `.env` en la raíz del proyecto (d:\DentalFlow\.env)
2. Ve al final del archivo

## Paso 2: Agregar estas líneas

Copia y pega estas líneas AL FINAL del archivo .env:

```env
# Google Maps API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBsJvPtowJLMbFvHTUm4edciXi03GFA57U
GOOGLE_MAPS_SERVER_API_KEY=AIzaSyBsJvPtowJLMbFvHTUm4edciXi03GFA57U
```

**Nota**: Estoy usando la misma key para cliente y servidor por ahora. 
Más adelante puedes crear una key separada para el servidor con restricciones de IP.

## Paso 3: Guardar el archivo

Guarda el archivo .env (Ctrl + S)

## Paso 4: Reiniciar el servidor

1. Ve a la terminal donde corre `npm run dev`
2. Presiona `Ctrl + C` para detener el servidor
3. Ejecuta nuevamente: `npm run dev`

## Paso 5: Verificar

Abre la consola del navegador (F12) y ejecuta:
```javascript
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
```

Deberías ver: `AIzaSyBsJvPtowJLMbFvHTUm4edciXi03GFA57U`

---

**IMPORTANTE**: 
- ⚠️ NO SUBAS el archivo .env a GitHub
- ⚠️ Esta API key es PÚBLICA ahora (la compartiste en el chat)
- ⚠️ Después de las pruebas, deberías:
  1. Ir a Google Cloud Console
  2. Regenerar la key o crear una nueva
  3. Configurar restricciones de dominio/IP

---

**Cuando hayas completado estos pasos, avísame para continuar con el frontend.**
