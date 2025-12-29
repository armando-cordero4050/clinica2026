export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clinics: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            patients: {
                Row: {
                    id: string
                    clinic_id: string
                    first_name: string
                    last_name: string
                    email: string | null
                    phone: string | null
                    gender: string | null
                    date_of_birth: string | null
                    dni_nit: string | null
                    address: Json | null
                    currency_code: string
                    created_at: string
                    updated_at: string
                    created_by: string | null
                    updated_by: string | null
                }
                Insert: {
                    id?: string
                    clinic_id: string
                    first_name: string
                    last_name: string
                    email?: string | null
                    phone?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    dni_nit?: string | null
                    address?: Json | null
                    currency_code?: string
                    created_at?: string
                    updated_at?: string
                    created_by?: string | null
                    updated_by?: string | null
                }
                Update: {
                    id?: string
                    clinic_id?: string
                    first_name?: string
                    last_name?: string
                    email?: string | null
                    phone?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    dni_nit?: string | null
                    address?: Json | null
                    currency_code?: string
                    created_at?: string
                    updated_at?: string
                    created_by?: string | null
                    updated_by?: string | null
                }
            }
        }
    }
}
