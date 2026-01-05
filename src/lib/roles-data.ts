// Roles data structure
export const ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    type: 'Sistema',
    description: 'Administrador de Plataforma con acceso completo',
    level: 'Completo',
    color: 'yellow'
  },
  {
    id: 'lab_admin',
    name: 'Administrador de Laboratorio',
    type: 'Laboratorio',
    description: 'Gestiona operaciones del laboratorio',
    level: 'Laboratorio',
    color: 'purple'
  },
  {
    id: 'lab_staff',
    name: 'Personal de Laboratorio',
    type: 'Laboratorio',
    description: 'Ejecuta tareas de producción',
    level: 'Laboratorio',
    color: 'purple'
  },
  {
    id: 'clinic_admin',
    name: 'Administrador de Clínica',
    type: 'Clínica',
    description: 'Gestiona su clínica completamente',
    level: 'Clínica',
    color: 'blue'
  },
  {
    id: 'clinic_doctor',
    name: 'Doctor',
    type: 'Clínica',
    description: 'Atiende pacientes y crea órdenes',
    level: 'Clínica',
    color: 'blue'
  },
  {
    id: 'clinic_receptionist',
    name: 'Recepcionista',
    type: 'Clínica',
    description: 'Gestiona agenda y caja',
    level: 'Clínica',
    color: 'blue'
  },
  {
    id: 'clinic_staff',
    name: 'Personal de Clínica',
    type: 'Clínica',
    description: 'Personal general con acceso limitado',
    level: 'Clínica',
    color: 'blue'
  },
  {
    id: 'courier',
    name: 'Mensajero',
    type: 'Logística',
    description: 'Gestiona entregas y rutas',
    level: 'Rutas',
    color: 'green'
  }
]

// Menu permissions matrix
export const MENU_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'Dashboard': {
    super_admin: true,
    lab_admin: true,
    lab_staff: true,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: true,
    clinic_staff: true,
    courier: true
  },
  'Gestionar Usuarios': {
    super_admin: true,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Control de Módulos': {
    super_admin: true,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Gestión de Clínicas': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Kanban': {
    super_admin: true,
    lab_admin: true,
    lab_staff: true,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Servicios': {
    super_admin: true,
    lab_admin: true,
    lab_staff: true,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: true,
    clinic_staff: false,
    courier: false
  },
  'Odoo Sync': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Rutas': {
    super_admin: true,
    lab_admin: true,
    lab_staff: true,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: true
  },
  'Agenda': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: true,
    clinic_staff: true,
    courier: false
  },
  'Pacientes': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: true,
    clinic_staff: true,
    courier: false
  },
  'Staff': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Caja / Cobrar': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: true,
    clinic_staff: false,
    courier: false
  },
  'Reportes': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Configuración': {
    super_admin: true,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  }
}

// Actions permissions matrix
export const ACTION_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'Crear pacientes': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: true,
    clinic_staff: false,
    courier: false
  },
  'Editar pacientes': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Gestionar staff': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Cambiar roles': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Resetear contraseñas': {
    super_admin: true,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Crear órdenes de lab': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: true,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Gestionar órdenes (Kanban)': {
    super_admin: true,
    lab_admin: true,
    lab_staff: true,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Sincronizar con Odoo': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Ver reportes financieros': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Cobrar servicios': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: true,
    clinic_staff: false,
    courier: false
  },
  'Generar facturas SAT': {
    super_admin: false,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: true,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Gestionar rutas': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: true
  },
  'Ver todas las clínicas': {
    super_admin: true,
    lab_admin: true,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  },
  'Configurar sistema': {
    super_admin: true,
    lab_admin: false,
    lab_staff: false,
    clinic_admin: false,
    clinic_doctor: false,
    clinic_receptionist: false,
    clinic_staff: false,
    courier: false
  }
}
