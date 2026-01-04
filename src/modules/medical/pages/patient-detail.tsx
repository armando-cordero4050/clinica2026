'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  Trash2,
  X,
  FileIcon,
  Plus
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Odontogram } from '@/modules/medical/components/odontogram'

// Componente Accordion local para réplica exacta
const AccordionSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-sm mb-4 overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-cyan-600 uppercase text-sm">{title}</span>
        <ChevronDown className={`h-5 w-5 text-cyan-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 bg-white border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = (Array.isArray(params.id) ? params.id[0] : params.id) || ''
  const [activeTab, setActiveTab] = useState('questionnaire')
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalData: true,
    contactData: false,
    medicalHistory: false,
    appointments: false,
    notes: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Mock patient data
  const patient = {
    id: patientId || '1',
    name: 'Juan Pérez García',
    createdAt: '31 de dic 2025',
    avatar: '',
    phone: '+52 1234567890',
    email: 'juan.perez@example.com',
    birthDate: '1985-03-15',
    age: 39,
    gender: 'Masculino',
    address: 'Av. Reforma 123, Col. Centro',
    city: 'Ciudad de México',
    occupation: 'Ingeniero',
    civilStatus: 'Casado',
    clinic: 'Clínica Sonrisas 2026',
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
           <User className="h-12 w-12 text-cyan-600" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500">Paciente desde {patient.createdAt}</p>
            </div>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors">
                  Editar Perfil
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{patient.age} años ({patient.birthDate})</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="h-4 w-4" />
              <span className="text-sm text-red-500 font-medium">Alérgico a Penicilina</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 border border-gray-200 w-full justify-start h-12">
          <TabsTrigger value="questionnaire" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 text-gray-600">Ficha</TabsTrigger>
          <TabsTrigger value="odontogram" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 text-gray-600">Odontograma</TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 text-gray-600">Estado de Cuenta</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 text-gray-600">Archivos</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="questionnaire" className="mt-0 space-y-4">
             {/* Personal Data */}
             <AccordionSection title="Datos Personales" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Nombre Completo</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.name}</p>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de Nacimiento</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.birthDate}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Edad</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.age} años</p>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Sexo</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.gender}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Ocupación</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.occupation}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Estado Civil</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.civilStatus}</p>
                    </div>
                </div>
             </AccordionSection>

             {/* Contact Data */}
             <AccordionSection title="Datos de Contacto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Teléfono Móvil</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.phone}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.email}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Dirección</label>
                        <p className="text-gray-900 border-b border-gray-100 py-1">{patient.address}, {patient.city}</p>
                    </div>
                </div>
             </AccordionSection>

              {/* Medical History Placeholder */}
              <AccordionSection title="Antecedentes Médicos">
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded text-yellow-800 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                          <p className="font-semibold">Alergias Conocidas</p>
                          <p>Penicilina</p>
                      </div>
                  </div>
              </AccordionSection>
              
               {/* Appointments Placeholder */}
              <AccordionSection title="Citas">
                  <div className="text-center text-gray-500 py-8">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay citas próximas programadas</p>
                  </div>
              </AccordionSection>

          </TabsContent>

          <TabsContent value="odontogram" className="mt-0">
            <Odontogram patientId={patientId} patientName={patient.name} />
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Estado de cuenta - En desarrollo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Archivos - En desarrollo</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
