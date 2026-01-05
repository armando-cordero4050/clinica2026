# 🦷 DentalFlow - Sistema de Gestión Dental

**Versión:** 1.0.0  
**Fecha:** 2026-01-04  
**Estado:** ✅ Producción  

---

## 📋 Descripción

DentalFlow es un sistema completo de gestión para clínicas dentales y laboratorios, desarrollado con tecnologías modernas y arquitectura cloud-first.

### **Características Principales:**
- 🏥 **Gestión de Pacientes**: Expedientes digitales completos
- 🦷 **Odontograma Interactivo**: Diagnóstico visual con SVG
- 🔬 **Órdenes de Laboratorio**: Wizard completo con SLA automático
- 📦 **Catálogo de Materiales**: CRUD admin para gestión de productos
- 📊 **Kanban de Laboratorio**: Seguimiento de órdenes en tiempo real
- 💰 **Presupuestos**: Generación automática con aprobación
- 📈 **Reportes**: Estadísticas y métricas en tiempo real
- 🔐 **Multi-tenancy**: Soporte para múltiples clínicas

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework**: React 18 + Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + shadcn/ui
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Data Fetching**: TanStack React Query

### **Backend**
- **BaaS**: Supabase Cloud
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Functions

### **Integraciones**
- **ERP**: Odoo.sh (para laboratorio)
- **Monitoreo**: Sentry
- **Email**: Resend

---

## 📁 Estructura del Proyecto

```
DentalFlow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Layout con sidebar
│   │   ├── dashboard/          # Rutas principales
│   │   └── login/              # Autenticación
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── lab/                # Componentes de laboratorio
│   │   └── shared/             # Componentes compartidos
│   ├── modules/                # Módulos de negocio
│   │   ├── core/               # Configuración y admin
│   │   ├── medical/            # Módulo médico
│   │   └── lab/                # Módulo de laboratorio
│   ├── lib/                    # Utilidades y helpers
│   └── types/                  # Definiciones TypeScript
├── supabase/
│   └── migrations/             # Migraciones SQL
├── docs/                       # Documentación
├── scripts/                    # Scripts de utilidad
└── public/                     # Archivos estáticos
```

---

## 🚀 Instalación

### **Requisitos Previos**
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

### **Pasos**

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/clinica2026.git
cd clinica2026
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

4. **Ejecutar migraciones**
```bash
# Conectar a tu proyecto de Supabase
npx supabase link --project-ref tu-project-ref

# Aplicar migraciones
npx supabase db push
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📚 Módulos Implementados

### **1. Gestión de Pacientes**
- Registro completo de pacientes
- Historial médico
- Documentos adjuntos
- Búsqueda avanzada

### **2. Odontograma**
- Representación visual SVG
- Diagnóstico por diente
- Colores por estado
- Integración con órdenes de lab

### **3. Órdenes de Laboratorio**
- Wizard de 3 pasos
- Selección de materiales desde DB
- SLA automático (días hábiles)
- Modo "Orden Express"
- Kanban de seguimiento

### **4. Catálogo de Materiales**
- CRUD completo
- Materiales y configuraciones
- Precios y SLA
- Integración con Odoo

### **5. Presupuestos**
- Generación automática
- Aprobación por paciente
- Historial de versiones

### **6. Reportes**
- Dashboard de métricas
- Estadísticas por período
- Exportación a PDF/Excel

---

## 🗄️ Base de Datos

### **Esquemas**
- `public`: Configuración global
- `schema_medical`: Datos médicos y pacientes
- `schema_lab`: Órdenes de laboratorio
- `schema_finance`: Presupuestos y pagos

### **Tablas Principales**
- `patients`: Pacientes
- `dental_chart`: Odontograma
- `lab_orders`: Órdenes de laboratorio
- `lab_materials`: Catálogo de materiales
- `lab_configurations`: Variantes de materiales
- `budgets`: Presupuestos

---

## 🔐 Seguridad

### **Row Level Security (RLS)**
- Todas las tablas tienen RLS habilitado
- Políticas por rol (admin, doctor, lab, staff)
- Aislamiento por clínica (`clinic_id`)

### **Autenticación**
- Supabase Auth
- Roles personalizados
- JWT tokens

---

## 📖 Documentación

### **Documentos Clave**
- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/TASK_STATUS.md` - Estado de tareas
- `docs/PR_LOG.md` - Historial de cambios
- `docs/WIZARD_FINAL_CORRECCIONES.md` - Wizard de órdenes
- `docs/PLAN_CALENDARIO_LABORATORIO.md` - Calendario (pendiente)

---

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:coverage
```

---

## 🚢 Deployment

### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Variables de Entorno en Vercel**
Configurar las mismas variables de `.env.local` en el dashboard de Vercel.

---

## 📊 Estado del Proyecto

### **Completado** ✅
- [x] Autenticación y roles
- [x] Gestión de pacientes
- [x] Odontograma interactivo
- [x] Wizard de órdenes de lab
- [x] Catálogo de materiales (CRUD)
- [x] SLA automático
- [x] Orden Express
- [x] Kanban de laboratorio
- [x] Presupuestos básicos

### **En Progreso** 🚧
- [ ] Calendario de laboratorio
- [ ] Reportes avanzados
- [ ] Integración completa con Odoo
- [ ] Notificaciones por email

### **Pendiente** 📝
- [ ] Módulo de farmacia
- [ ] Inventario
- [ ] Citas (calendario)
- [ ] Facturación electrónica

---

## 👥 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto es privado y propietario.

---

## 👨‍💻 Desarrollado por

**Antigravity AI + Usuario**  
Fecha: 2026-01-04  

---

## 📞 Soporte

Para soporte, contactar a: [tu-email@ejemplo.com]

---

**¡Gracias por usar DentalFlow!** 🦷✨
