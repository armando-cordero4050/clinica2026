'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Patient } from '@/modules/medical/actions/patients';
import { Calendar, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface PatientSheetProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
}

export function PatientSheet({ patient, open, onOpenChange, clinicId }: PatientSheetProps) {
  const router = useRouter();

  const handleOpenHistory = () => {
    router.push(`/dashboard/medical/patients/${patient.id}`);
    onOpenChange(false);
  };

  const getAgeFromBirthDate = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {patient.first_name} {patient.last_name}
          </SheetTitle>
          <SheetDescription>
            Información rápida del paciente
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Patient Code */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Código de Paciente</p>
            <p className="text-lg font-mono">{patient.patient_code || '-'}</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Edad</p>
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {getAgeFromBirthDate(patient.date_of_birth)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Género</p>
              <p className="text-sm capitalize">
                {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-medium">Contacto</h3>
            
            {patient.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${patient.email}`} className="text-blue-600 hover:underline">
                  {patient.email}
                </a>
              </div>
            )}
            
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${patient.phone}`} className="hover:underline">
                  {patient.phone}
                </a>
              </div>
            )}
            
            {patient.mobile && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${patient.mobile}`} className="hover:underline">
                  {patient.mobile} (Móvil)
                </a>
              </div>
            )}

            {patient.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{patient.address}, {patient.city || ''}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Tags */}
          {patient.tags && patient.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Medical Info */}
          {(patient.allergies && patient.allergies.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-medium text-red-600">Alergias</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {patient.allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {patient.administrative_notes && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas Administrativas
              </h3>
              <p className="text-sm text-muted-foreground">
                {patient.administrative_notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" onClick={handleOpenHistory}>
              Abrir Historia Clínica Completa
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" disabled>
                Nueva Cita
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Nuevo Presupuesto
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
