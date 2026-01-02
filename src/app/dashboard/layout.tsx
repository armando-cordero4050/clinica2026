'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  Activity, 
  Truck, 
  Database, 
  Menu, 
  LogOut,
  Loader2,
  UserPlus,
  Layers,
  Hash,
  Timer,
  Building2,
  Wrench,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Pill,
  FileText,
  CreditCard,
  Receipt,
  Wallet,
  Building,
  Banknote
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // 1. Fetch Auth User
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 2. Fetch Profile Role via RPC (Safe V5 way)
        const { data: profile } = await supabase.rpc('get_my_profile')
        console.log('User Profile:', profile)
        setUserRole(profile?.role || 'patient')
      }

      // 3. Fetch Active Modules
      const { data: modules, error } = await supabase.rpc('get_all_modules')
      console.log('Active Modules:', modules)
      if (!error && modules) {
        const active = modules.filter((m: any) => m.is_active).map((m: any) => m.code)
        setActiveModules(active)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Define Isolated Menu Sections
  const isLabUser = userRole === 'lab_admin' || userRole === 'lab_staff'
  const isPlatformAdmin = userRole === 'super_admin'
  const isClinicUser = ['clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist'].includes(userRole || '')

  return (
    <div className="flex h-screen bg-gray-100">
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl text-blue-600">DentalFlow</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {loading ? (
             <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-blue-500"/></div>
          ) : (
            <>
              {/* PLATFORM ADMIN SECTION */}
              {isPlatformAdmin && (
                <div className="space-y-1">
                  <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Administración</p>
                  <NavItem item={{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Gestionar Usuarios', href: '/dashboard/admin/users', icon: UserPlus }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Control de Módulos', href: '/dashboard/admin/modules', icon: Database }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}

              {/* LABORATORY AISLE */}
              {(isLabUser || isPlatformAdmin) && activeModules.includes('lab_kanban') && (
                <div className="space-y-1">
                  <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Taller Laboratorio</p>
                  <NavItem item={{ name: 'Dashboard Lab', href: '/dashboard/lab', icon: Package }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'KAMBA', href: '/dashboard/lab/kamba', icon: Layers }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Rendimiento', href: '/dashboard/lab/performance', icon: Activity }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}

              {/* LABORATORY CONFIGURATION */}
              {(isLabUser || isPlatformAdmin) && (
                <div className="space-y-1 mt-4">
                  <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Configuración Lab</p>
                  <NavItem item={{ name: 'Órdenes Global', href: '/dashboard/lab', icon: Package }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Correlativos', href: '/dashboard/settings/correlatives', icon: Hash }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Tiempos (SLA)', href: '/dashboard/settings/sla', icon: Timer }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Servicios', href: '/dashboard/admin/services', icon: Package }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Odoo Sync', href: '/dashboard/settings/odoo', icon: Truck }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}

              {/* CLINICS MANAGEMENT (for Lab and Admin users only) */}
              {(isPlatformAdmin || isLabUser) && (
                <div className="space-y-1 mt-4">
                  <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Gestión de Clínicas</p>
                  <NavItem item={{ name: 'Clínicas', href: '/dashboard/admin/clinics', icon: Building2 }} pathname={pathname} isOpen={isSidebarOpen} />
                  <NavItem item={{ name: 'Facturas Clínicas', href: '/dashboard/admin/clinics/invoices', icon: Receipt }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}

              {/* CLINIC MODULE - Complete Menu for Clinic Users */}
              {isClinicUser && (
                <>
                  {/* Dashboard */}
                  <div className="space-y-1 mt-4">
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Clínica</p>
                    <NavItem item={{ name: 'Dashboard', href: '/dashboard/medical', icon: LayoutDashboard }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Agenda', href: '/dashboard/medical/appointments', icon: Calendar }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Pacientes', href: '/dashboard/medical/patients', icon: Users }} pathname={pathname} isOpen={isSidebarOpen} />
                  </div>

                  {/* Caja - Financial Management */}
                  <div className="space-y-1 mt-4">
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Caja</p>
                    <NavItem item={{ name: 'Cobrar', href: '/dashboard/medical/cashier', icon: DollarSign }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Proveedores', href: '/dashboard/medical/suppliers', icon: Building }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Cuentas por Pagar', href: '/dashboard/medical/accounts-payable', icon: Receipt }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Cuentas por Cobrar', href: '/dashboard/medical/accounts-receivable', icon: Wallet }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'SAT / Facturación', href: '/dashboard/medical/invoicing', icon: FileText }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Pasarela de Pago', href: '/dashboard/medical/payment-gateway', icon: CreditCard }} pathname={pathname} isOpen={isSidebarOpen} />
                  </div>

                  {/* Services and Pharmacy */}
                  <div className="space-y-1 mt-4">
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Servicios</p>
                    <NavItem item={{ name: 'Servicios', href: '/dashboard/medical/services', icon: Wrench }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Farmacia', href: '/dashboard/medical/pharmacy', icon: Pill }} pathname={pathname} isOpen={isSidebarOpen} />
                  </div>

                  {/* Analytics and Reports */}
                  <div className="space-y-1 mt-4">
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Análisis</p>
                    <NavItem item={{ name: 'Productividad', href: '/dashboard/medical/productivity', icon: TrendingUp }} pathname={pathname} isOpen={isSidebarOpen} />
                    <NavItem item={{ name: 'Reportes', href: '/dashboard/medical/reports', icon: BarChart3 }} pathname={pathname} isOpen={isSidebarOpen} />
                  </div>

                  {/* Laboratory Orders */}
                  <div className="space-y-1 mt-4">
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Laboratorios</p>
                    <NavItem item={{ name: 'Órdenes de Lab', href: '/dashboard/medical/lab-orders', icon: Package }} pathname={pathname} isOpen={isSidebarOpen} />
                  </div>
                </>
              )}

              {/* SHARED SETTINGS (Visible to Admins only) */}
              {(isPlatformAdmin || userRole === 'clinic_admin' || userRole === 'lab_admin') && (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                  <NavItem item={{ name: 'Configuración', href: '/dashboard/settings', icon: Settings }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}

              {/* PATIENT / GUEST FALLBACK */}
              {(!isLabUser && !isClinicUser && !isPlatformAdmin) && (
                <div className="space-y-1">
                   <p className={`text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>Acceso Limitado</p>
                   <NavItem item={{ name: 'Información Básica', href: '/dashboard', icon: LayoutDashboard }} pathname={pathname} isOpen={isSidebarOpen} />
                </div>
              )}
            </>
          )}
        </nav>

        {/* USER PROFILE INFO (Footer) */}
        {!loading && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
             {isSidebarOpen ? (
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 truncate">{userRole?.toUpperCase()}</span>
                  <span className="text-[10px] text-gray-400">DentalFlow v5 Core</span>
               </div>
             ) : (
               <div className="flex justify-center">
                  <Badge variant="outline" className="text-[8px] px-1 h-4">{userRole?.charAt(0).toUpperCase()}</Badge>
               </div>
             )}
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className={`w-full flex items-center gap-2 ${!isSidebarOpen && 'px-2 justify-center'}`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ item, pathname, isOpen }: { item: any, pathname: string, isOpen: boolean }) {
    const Icon = item.icon
    const isActive = pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href
    
    return (
      <Link href={item.href}>
        <div 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Icon className="h-5 w-5" />
          {isOpen && <span>{item.name}</span>}
        </div>
      </Link>
    )
}
