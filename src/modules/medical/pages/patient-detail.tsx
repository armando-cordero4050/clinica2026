'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Heart,
  Pill,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  MoreVertical,
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
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id
  const [activeTab, setActiveTab] = useState('questionnaire')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Patient Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="w-16 h-16 border-2 border-cyan-500">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xl font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <p className="text-sm text-gray-500">Creado el {patient.createdAt} • {patient.clinic}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-8 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-cyan-600 border-cyan-600">
                <Calendar className="h-3 w-3 mr-1" />
                Próxima cita
              </Badge>
              <span className="text-gray-600">Pendiente asignar</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-red-600 border-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Alergias
              </Badge>
              <span className="text-gray-600">Ninguna registrada</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">F. Inicio:</span>
              <span className="ml-2 font-medium">31/12/2025</span>
            </div>
            <div>
              <span className="text-gray-500">Edad:</span>
              <span className="ml-2 font-medium">{patient.age} años</span>
            </div>
            <div>
              <span className="text-gray-500">Atenciones:</span>
              <span className="ml-2 font-medium">0</span>
            </div>
            <div>
              <span className="text-gray-500">Deudas:</span>
              <span className="ml-2 font-medium text-green-600">$0.00</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="filiation" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <User className="h-4 w-4 mr-2" />
              Filiación
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Historia Clínica
            </TabsTrigger>
            <TabsTrigger 
              value="odontogram" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Odontograma
            </TabsTrigger>
            <TabsTrigger 
              value="periodontogram" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Periodontograma
            </TabsTrigger>
            <TabsTrigger 
              value="orthodontics" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <Pill className="h-4 w-4 mr-2" />
              Ortodoncia
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Estado de Cuenta
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent px-6 py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Archivos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <Tabs value={activeTab} className="w-full">
          {/* Filiación Tab */}
          <TabsContent value="filiation" className="mt-0 space-y-6">
            {/* Datos Personales */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('personalData')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Datos Personales</CardTitle>
                  {expandedSections.personalData ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              {expandedSections.personalData && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="nombre">Nombre*</Label>
                      <Input id="nombre" defaultValue="Juan" />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido*</Label>
                      <Input id="apellido" defaultValue="Pérez García" />
                    </div>
                    <div>
                      <Label htmlFor="documento">Documento</Label>
                      <Input id="documento" placeholder="PEPJ850315" />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="+52">
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+52">+52</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="1234567890" className="flex-1" defaultValue="1234567890" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nacimiento">Fech. de nacimiento</Label>
                      <Input id="nacimiento" type="date" defaultValue="1985-03-15" />
                    </div>
                    <div>
                      <Label htmlFor="edad">Edad</Label>
                      <Input id="edad" value="39 años" disabled />
                    </div>
                    <div>
                      <Label htmlFor="genero">Género</Label>
                      <Select defaultValue="masculino">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estado-civil">Estado civil</Label>
                      <Select defaultValue="casado">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soltero">Soltero/a</SelectItem>
                          <SelectItem value="casado">Casado/a</SelectItem>
                          <SelectItem value="divorciado">Divorciado/a</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ocupacion">Ocupación</Label>
                      <Input id="ocupacion" defaultValue="Ingeniero" />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input id="direccion" defaultValue="Av. Reforma 123, Col. Centro, Ciudad de México" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="juan.perez@example.com" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Citas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Citas</CardTitle>
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-cyan-600">
                    <TableRow>
                      <TableHead className="text-white">Fecha</TableHead>
                      <TableHead className="text-white">Doctor</TableHead>
                      <TableHead className="text-white">Motivo</TableHead>
                      <TableHead className="text-white">Estado</TableHead>
                      <TableHead className="text-white">Comentario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No hay citas registradas
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Odontograma Tab */}
          <TabsContent value="odontogram" className="mt-0">
            <Odontogram patientId={patient.id} />
          </TabsContent>

          {/* Historia Clínica Tab */}
          <TabsContent value="history" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="anamnesis-odontologia" className="w-full">
                  <TabsList className="w-full justify-start bg-gray-100 overflow-x-auto">
                    <TabsTrigger value="anamnesis-odontologia" className="whitespace-nowrap">Anam. Odontología</TabsTrigger>
                    <TabsTrigger value="nota-evolucion" className="whitespace-nowrap">Nota evolución breve</TabsTrigger>
                    <TabsTrigger value="anamnesis-odontopediatria" className="whitespace-nowrap">Anam. Odontopediatría</TabsTrigger>
                    <TabsTrigger value="endodoncia" className="whitespace-nowrap">Endodoncia</TabsTrigger>
                    <TabsTrigger value="signos-vitales" className="whitespace-nowrap">Signos Vitales</TabsTrigger>
                    <TabsTrigger value="consentimientos" className="whitespace-nowrap">Consentimientos</TabsTrigger>
                  </TabsList>

                  {/* Anam. Odontología (Antes Cuestionario) */}
                  <TabsContent value="anamnesis-odontologia" className="mt-6 animate-in fade-in-50">
                    
                    {/* Header: Doctor Selector */}
                    <div className="flex items-center justify-between mb-6 px-1">
                      <div className="flex items-center gap-2 w-1/2">
                        <Label className="text-gray-500 font-medium text-sm">Doctor:</Label>
                        <Select defaultValue="jorge">
                          <SelectTrigger className="w-full max-w-xs border-none shadow-none text-cyan-500 text-base font-normal h-auto p-0 hover:bg-transparent focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jorge">jorge cordero</SelectItem>
                            <SelectItem value="otro">Otro Doctor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="icon" className="text-cyan-500">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Acordeones */}
                    <div className="space-y-1">
                      
                      {/* Sección 1: Motivo de Consulta (Open by default) */}
                      <AccordionSection title="Sección" defaultOpen={true}>
                         <div className="space-y-2">
                            <Label className="text-gray-500 text-xs uppercase font-semibold">Motivo de consulta</Label>
                             <Input className="w-full border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-cyan-500 bg-transparent" placeholder="" />
                         </div>
                      </AccordionSection>

                      {/* Sección 2: Enfermedad Actual */}
                      <AccordionSection title="ENFERMEDAD ACTUAL" defaultOpen={true}>
                        <div className="space-y-6">
                           {[
                             "Tiempo de enfermedad",
                             "Signos y síntomas principales",
                             "Relato cronológico",
                             "Funciones biológicas"
                           ].map((label) => (
                             <div key={label} className="space-y-1">
                               <Label className="text-gray-500 text-xs uppercase font-semibold">{label}</Label>
                               <Input className="w-full border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-cyan-500 bg-transparent" />
                             </div>
                           ))}
                        </div>
                      </AccordionSection>

                      {/* Sección 3: Antecedentes */}
                      <AccordionSection title="ANTECEDENTES" defaultOpen={true}>
                        <div className="space-y-8">
                           {/* Inputs Text */}
                           <div className="space-y-6">
                              {["Antecedentes familiares", "Antecedentes personales"].map((label) => (
                                <div key={label} className="space-y-1">
                                  <Label className="text-gray-500 text-xs uppercase font-semibold">{label}</Label>
                                  <Input className="w-full border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-cyan-500 bg-transparent" />
                                </div>
                              ))}
                           </div>

                           {/* Radio Grid */}
                           <div>
                              <Label className="text-gray-500 text-sm font-medium mb-4 block">¿Tiene o ha tenido?</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                {[
                                  "Presión alta",
                                  "VIH",
                                  "Presión baja",
                                  "Diabetes",
                                  "Hepatitis",
                                  "Asma",
                                  "Gastritis",
                                  "¿Fuma?",
                                  "Úlceras",
                                  "Enfermedades sanguíneas",
                                  "Problemas cardíacos",
                                  "¿Padece de alguna otra enfermedad?",
                                  "¿Le sangra sus encías?",
                                  "¿Ha tenido hemorragias anormales después de una extracción?",
                                  "¿Hace rechinar o aprieta los dientes?",
                                  "Otras molestias en la boca",
                                  "Alergias",
                                  "¿Ha tenido alguna operación grande en los últimos años?",
                                  "¿Toma alguna medicación de manera permanente?"
                                ].map((item) => (
                                  <div key={item} className="flex flex-col space-y-2 pb-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    <div className="flex gap-4">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-5 h-5 border border-cyan-200 rounded flex items-center justify-center hover:border-cyan-400">
                                           <input type="radio" name={item.replace(/\s+/g, '-')} value="no" className="appearance-none w-full h-full checked:bg-cyan-500 rounded-sm" defaultChecked />
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">No</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-5 h-5 border border-cyan-200 rounded flex items-center justify-center hover:border-cyan-400">
                                           <input type="radio" name={item.replace(/\s+/g, '-')} value="si" className="appearance-none w-full h-full checked:bg-cyan-500 rounded-sm" />
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">Si</span>
                                      </label>
                                    </div>
                                  </div>
                                ))}

                                {/* Inputs específicos dentro del grid */}
                                <div className="space-y-1">
                                    <Label className="text-gray-700 text-sm">Comentario adicional</Label>
                                    <Input className="w-full border-b border-gray-200 focus-visible:border-cyan-500 px-0 rounded-none bg-transparent" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-700 text-sm">¿Cuántas veces al día se cepilla?</Label>
                                    <Input type="number" className="w-full border-b border-gray-200 focus-visible:border-cyan-500 px-0 rounded-none bg-transparent" />
                                </div>
                              </div>
                           </div>
                        </div>
                      </AccordionSection>

                      {/* Sección 4: Examen Clínico */}
                      <AccordionSection title="EXAMEN CLINICO" defaultOpen={true}>
                        <div className="space-y-6">
                           {/* Signos Vitales */}
                           <div className="space-y-3">
                              <Label className="text-gray-500 text-xs uppercase font-semibold">Signos vitales:</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { label: "PA", suffix: "mmgh" },
                                  { label: "FC", suffix: "bpm" },
                                  { label: "Temperatura", suffix: "°C" },
                                  { label: "FR", suffix: "r/m" }
                                ].map((sign) => (
                                  <div key={sign.label} className="flex rounded-md border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500">
                                    <div className="flex-1 bg-white px-3 py-2">
                                       <span className="text-xs text-gray-400 block">{sign.label}</span>
                                       <input className="w-full outline-none text-sm text-gray-700" placeholder="0" />
                                    </div>
                                    <div className="bg-gray-100 flex items-center px-2 text-xs text-gray-500 font-medium">
                                       {sign.suffix}
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                           
                           {/* Textareas */}
                           {[
                             "Examen extraoral",
                             "Examen intraoral",
                             "Resultado de exámenes auxiliares",
                             "Observaciones"
                           ].map((label) => (
                             <div key={label} className="space-y-2">
                               <Label className="text-gray-500 text-xs uppercase font-semibold">{label}</Label>
                               <Textarea className="min-h-[80px] bg-white border-gray-200 focus:border-cyan-500 transition-colors" />
                             </div>
                           ))}
                        </div>
                      </AccordionSection>

                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-center pt-6 pb-4">
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-white min-w-[200px] shadow-sm uppercase tracking-wider font-semibold text-sm h-10">
                        Guardar
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Nota evolución breve */}
                  <TabsContent value="nota-evolucion" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Nota evolución breve - En desarrollo</p>
                    </div>
                  </TabsContent>

                  {/* Anam. Odontopediatría */}
                  <TabsContent value="anamnesis-odontopediatria" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Anamnesis Odontopediatría - En desarrollo</p>
                    </div>
                  </TabsContent>

                  {/* Endodoncia */}
                  <TabsContent value="endodoncia" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Endodoncia - En desarrollo</p>
                    </div>
                  </TabsContent>

                  {/* Signos Vitales */}
                  <TabsContent value="signos-vitales" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Signos Vitales - En desarrollo</p>
                    </div>
                  </TabsContent>

                  {/* Consentimientos */}
                  <TabsContent value="consentimientos" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Consentimientos - En desarrollo</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="periodontogram" className="mt-0">
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Periodontograma - En desarrollo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orthodontics" className="mt-0">
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Pill className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Ortodoncia - En desarrollo</p>
              </CardContent>
            </Card>
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
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Archivos - En desarrollo</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
