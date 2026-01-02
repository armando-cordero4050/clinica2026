'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Patient } from '@/modules/medical/actions/patients';
import { User, FileText, Activity, DollarSign, FileImage } from 'lucide-react';

interface PatientHistoryTabsProps {
  patient: Patient;
}

export function PatientHistoryTabs({ patient }: PatientHistoryTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Datos Generales</span>
        </TabsTrigger>
        <TabsTrigger value="evolution" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Evolución</span>
        </TabsTrigger>
        <TabsTrigger value="odontogram" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Odontograma</span>
        </TabsTrigger>
        <TabsTrigger value="budgets" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Presupuestos</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          <span className="hidden sm:inline">Documentos</span>
        </TabsTrigger>
      </TabsList>

      {/* General Data */}
      <TabsContent value="general" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Datos personales y de contacto del paciente</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                <p className="text-base">{patient.first_name} {patient.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código de Paciente</p>
                <p className="text-base font-mono">{patient.patient_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de ID</p>
                <p className="text-base uppercase">{patient.id_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de ID</p>
                <p className="text-base">{patient.id_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                <p className="text-base">
                  {patient.date_of_birth 
                    ? new Date(patient.date_of_birth).toLocaleDateString('es-GT')
                    : '-' 
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Género</p>
                <p className="text-base capitalize">
                  {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{patient.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-base">{patient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Celular</p>
                  <p className="text-base">{patient.mobile || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-base">
                    {patient.address ? `${patient.address}, ${patient.city || ''}` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Información Médica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Sangre</p>
                  <p className="text-base">{patient.blood_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alergias</p>
                  <p className="text-base">
                    {patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.join(', ')
                      : 'Ninguna registrada'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Condiciones Crónicas</p>
                  <p className="text-base">
                    {patient.chronic_conditions && patient.chronic_conditions.length > 0
                      ? patient.chronic_conditions.join(', ')
                      : 'Ninguna registrada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergency_contact_name && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Contacto de Emergencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                    <p className="text-base">{patient.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-base">{patient.emergency_contact_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relación</p>
                    <p className="text-base">{patient.emergency_contact_relationship || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Evolution Notes */}
      <TabsContent value="evolution" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Notas de Evolución</CardTitle>
            <CardDescription>Historial clínico y notas médicas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Módulo de Notas de Evolución en desarrollo...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Odontogram */}
      <TabsContent value="odontogram" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Odontograma</CardTitle>
            <CardDescription>Mapa dental interactivo con hallazgos clínicos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Componente de Odontograma en desarrollo...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Budgets */}
      <TabsContent value="budgets" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Presupuestos</CardTitle>
            <CardDescription>Cotizaciones y planes de tratamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Módulo de Presupuestos en desarrollo...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Documents */}
      <TabsContent value="documents" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>Radiografías, fotos y documentos del paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Módulo de Documentos en desarrollo...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
