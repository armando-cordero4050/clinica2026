# Clinical V2 Module

Sistema completo de odontograma interactivo y gestión de órdenes de laboratorio dental.

## 📋 Contenido

- [Estructura](#estructura)
- [Características](#características)
- [Uso](#uso)
- [Integración](#integración)
- [Tecnologías](#tecnologías)

## 🏗️ Estructura

```
src/modules/clinical-v2/
├── types/
│   └── index.ts                    # Tipos TypeScript compartidos
├── stores/
│   └── dental-session-store.ts     # Estado Zustand para sesión clínica
├── constants/
│   └── dental.ts                   # Sistema FDI, superficies, catálogo de hallazgos
├── components/
│   ├── odontogram/
│   │   ├── index.tsx               # Componente principal del odontograma
│   │   ├── tooth-chart.tsx         # SVG interactivo con 32 dientes
│   │   ├── finding-dialog.tsx      # Modal para agregar hallazgos
│   │   └── findings-panel.tsx      # Panel/tabla de hallazgos registrados
│   └── lab-wizard/
│       ├── index.tsx               # Wizard contenedor con 4 pasos
│       ├── step-material.tsx       # Paso 1: Selección de material
│       ├── step-items.tsx          # Paso 2: Configuración de items
│       ├── step-shipping.tsx       # Paso 3: Logística y envío
│       └── step-review.tsx         # Paso 4: Revisión y confirmación
├── actions/
│   ├── findings.ts                 # Server actions para guardar hallazgos
│   └── lab-orders.ts               # Server actions para crear órdenes
└── hooks/
    └── use-dental-session.ts       # Hook para acceder al store
```

## ✨ Características

### Odontograma Interactivo

- **Sistema FDI de Numeración**: 32 dientes adultos (11-48) y 20 dientes temporales (51-85)
- **Superficies Individuales**: Oclusal, Mesial, Distal, Vestibular, Lingual
- **Visualización con Colores**: Cada hallazgo tiene un color específico en el SVG
- **Clickeable**: Haz clic en cualquier superficie para registrar hallazgos

### Catálogo de Hallazgos

#### Clínicos (no requieren laboratorio)
- Sano, Caries, Caries Inactiva, Fractura, Ausente, Movilidad, Retracción Gingival

#### Existentes (trabajos previos)
- Amalgama, Resina Composite, Sellante, Corona, Puente, Implante, Endodoncia

#### De Laboratorio (requieren orden)
- Corona, Puente, Carilla, Incrustación, Prótesis Parcial, Prótesis Total, Corona sobre Implante, Aparato Ortodóntico, Provisional

### Lab Wizard (4 Pasos)

1. **Material**: Selección de material base y configuración específica
2. **Items**: Configuración de dientes, colores/shades, precios
3. **Envío**: Opciones de logística (pickup, courier, digital) y urgencia
4. **Revisión**: Confirmación final con fecha objetivo y notas

### Estado Zustand

Gestión centralizada de:
- Información del paciente
- Hallazgos registrados
- Selección actual (diente/superficie)
- Estado del wizard
- Getters para hallazgos de laboratorio

## 🚀 Uso

### Página de Demo

Visita `/dashboard/clinical-v2/demo` para ver el sistema completo en acción.

### Integración en tu Componente

```tsx
import { Odontogram } from '@/modules/clinical-v2/components/odontogram';
import { LabWizard } from '@/modules/clinical-v2/components/lab-wizard';
import { useDentalSession } from '@/modules/clinical-v2/hooks/use-dental-session';

function MiComponente({ patientId, patientName }) {
  const { openWizard, getPendingLabFindings } = useDentalSession();

  const handleOpenLabWizard = () => {
    const pendingFindings = getPendingLabFindings();
    const initialItems = pendingFindings.map(finding => ({
      configurationId: '',
      toothNumber: finding.toothNumber,
      color: '',
      unitPrice: 0,
      clinicalFindingId: finding.id,
    }));
    openWizard(initialItems);
  };

  return (
    <>
      <Odontogram 
        patientId={patientId}
        patientName={patientName}
        onOpenLabWizard={handleOpenLabWizard}
      />
      <LabWizard />
    </>
  );
}
```

## 🔗 Integración con el Sistema Existente

### Tablas de Base de Datos Reutilizadas
- `patients`: Información de pacientes
- `dental_chart`: Almacenamiento de hallazgos
- `lab_orders`: Órdenes de laboratorio
- `lab_order_items`: Items de las órdenes
- `lab_materials`: Materiales disponibles
- `lab_configurations`: Configuraciones de materiales

### Componentes UI Reutilizados
- Todos los componentes de `@/components/ui/*`
- `ShadeMapSelector` para selección de colores dentales
- `getLabMaterials` y `getLabConfigurations` del módulo core

### Server Actions Reutilizadas
- `createLabOrder` de `@/actions/lab-orders`

## 🛠️ Tecnologías

- **React 19** con Server Components
- **Next.js 16** con App Router
- **TypeScript** para type safety
- **Zustand** para gestión de estado
- **Tailwind CSS** para estilos
- **Radix UI** para componentes accesibles
- **Framer Motion** para animaciones
- **Sonner** para notificaciones toast
- **date-fns** para manejo de fechas
- **Lucide React** para iconos

## 📝 Notas Importantes

1. **Arquitectura Limpia**: El módulo es completamente independiente y no modifica archivos existentes
2. **Type-Safe**: Todo está completamente tipado con TypeScript
3. **Server Actions**: Las operaciones de BD usan server actions con `'use server'`
4. **Client Components**: Los componentes interactivos usan `'use client'`
5. **Texto en Español**: Toda la UI está en español
6. **Sistema FDI**: Numeración dental internacional estándar
7. **Responsive**: Los componentes son responsivos y adaptables

## 🔒 Seguridad

- ✅ Sin vulnerabilidades detectadas por CodeQL
- ✅ RLS (Row Level Security) en todas las tablas
- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de clinic_id en server actions

## 📦 Instalación de Dependencias

El módulo requiere que `zustand` esté instalado:

```bash
npm install zustand
```

Todas las demás dependencias ya existen en el proyecto.

## 🎨 Personalización

### Agregar Nuevos Hallazgos

Edita `src/modules/clinical-v2/constants/dental.ts`:

```typescript
export const FINDINGS_CATALOG: FindingDefinition[] = [
  // ... hallazgos existentes
  {
    id: 'mi_hallazgo',
    name: 'Mi Hallazgo Custom',
    shortName: 'MH',
    color: '#ff00ff',
    category: 'clinical',
    requiresLabOrder: false,
    description: 'Descripción del hallazgo',
  },
];
```

### Personalizar Colores del SVG

Modifica las constantes de color en los componentes o ajusta el sistema de temas.

## 🐛 Troubleshooting

### Build falla con error de Google Fonts
Esto es un problema de red durante el build. En producción (Vercel), funciona correctamente.

### "Cannot find module zustand"
Ejecuta `npm install zustand`.

### Errores de importación
Asegúrate de que todas las rutas de importación usen el alias `@/` correctamente.

## 📄 Licencia

Este módulo es parte del proyecto DentalFlow.
