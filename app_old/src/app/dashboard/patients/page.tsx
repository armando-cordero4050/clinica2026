import { useState, useEffect } from 'react';
import { useSession } from '@/shared/lib/auth';
import { patientsApi } from '@/modules/patients/api/patients.api';
import { PatientForm } from '@/modules/patients/components/PatientForm';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"; // Assuming Dialog exists or I need to create it
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'; // Need to create Table
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function PatientsPage() {
  const { clinicId } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinicId) {
      loadPatients();
    }
  }, [clinicId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsApi.getPatients(clinicId!);
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      if (editingPatient) {
        await patientsApi.updatePatient(editingPatient.id, data);
      } else {
        await patientsApi.createPatient(data, clinicId!);
      }
      await loadPatients();
      setIsModalOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error('Error saving patient', error);
      // alert('Error saving patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paciente?')) return;
    try {
        await patientsApi.deletePatient(id);
        loadPatients();
    } catch(err) {
        console.error(err);
    }
  };

  const openNew = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingPatient(p);
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id_number && p.id_number.includes(searchTerm))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nombre o DNI..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado General</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No hay pacientes registrados.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredPatients.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                                <TableCell>{p.id_number || '-'}</TableCell>
                                <TableCell>{p.phone || '-'}</TableCell>
                                <TableCell>{p.email || '-'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
            <DialogDescription>
                Ingrese los datos del paciente. Todos los campos marcados son obligatorios.
            </DialogDescription>
            </DialogHeader>
            <PatientForm 
                initialData={editingPatient} 
                onSubmit={handleSave} 
                isLoading={saving}
                onCancel={() => setIsModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
