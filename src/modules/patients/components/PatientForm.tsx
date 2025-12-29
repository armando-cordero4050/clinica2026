import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { Patient } from "../api/patients.api";

// 1. Zod Schema
const patientSchema = z.object({
    first_name: z.string().min(2, "Nombre requerido"),
    last_name: z.string().min(2, "Apellido requerido"),
    date_of_birth: z.string().optional(), // ISO Date string
    gender: z.enum(["M", "F", "O"]).optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    dni_nit: z.string().optional(),
    currency_code: z.enum(["GTQ", "USD"]),
    address: z.object({
        line1: z.string().optional(),
        city: z.string().optional(),
    }).optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
    initialData?: Patient;
    onSubmit: (data: PatientFormValues) => void;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function PatientForm({ initialData, onSubmit, isLoading, onCancel }: PatientFormProps) {
    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: initialData ? {
            first_name: initialData.first_name,
            last_name: initialData.last_name,
            email: initialData.email || "",
            phone: initialData.phone || "",
            gender: (initialData.gender as "M" | "F" | "O") || "O", // Cast or provide fallback
            date_of_birth: initialData.date_of_birth || "",
            dni_nit: initialData.dni_nit || "",
            address: initialData.address as any || { line1: "", city: "" },
            currency_code: initialData.currency_code as "GTQ" | "USD" || "GTQ",
        } : {
            last_name: '',
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombres *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Juan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellidos *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Pérez" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Nacimiento</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Género</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="M">Masculino</SelectItem>
                                        <SelectItem value="F">Femenino</SelectItem>
                                        <SelectItem value="O">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Paciente"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
