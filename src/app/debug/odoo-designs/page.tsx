'use client'

import React, { useState } from 'react'
import { 
  RefreshCcw, 
  ExternalLink, 
  Database, 
  Eye, 
  Download, 
  Edit3, 
  Filter, 
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Settings2,
  Lock,
  Zap,
  LayoutGrid,
  List,
  HardDrive
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

// --- MOCK DATA ---
const MOCK_FIELDS = [
  { id: 'name', label: 'Nombre del producto', odoo: 'name', type: 'text', sync: true, view: true, read: true, write: false },
  { id: 'list_price', label: 'Precio de venta', odoo: 'list_price', type: 'decimal', sync: true, view: true, read: true, write: true },
  { id: 'standard_price', label: 'Costo', odoo: 'standard_price', type: 'decimal', sync: true, view: false, read: true, write: false },
  { id: 'default_code', label: 'Código/SKU', odoo: 'default_code', type: 'text', sync: true, view: true, read: true, write: true },
  { id: 'description', label: 'Descripción', odoo: 'description', type: 'html', sync: true, view: true, read: true, write: true },
  { id: 'categ_id', label: 'Categoría', odoo: 'categ_id', type: 'many2one', sync: true, view: true, read: true, write: false },
  { id: 'uom_id', label: 'Unidad de medida', odoo: 'uom_id', type: 'many2one', sync: false, view: false, read: true, write: false },
]

export default function OdooDesignsDemo() {
  const [activeTab, setActiveTab] = useState<'ocean' | 'banana' | 'minimalist'>('ocean')
  const [isSyncing, setIsSyncing] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-12 pb-24">
      {/* Header & Style Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Odoo <span className="text-blue-600 italic">Sync Lab</span></h1>
          <p className="text-slate-500 font-medium">Laboratorio de diseño para la nueva matriz de sincronización</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border">
          <button 
            onClick={() => setActiveTab('ocean')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ocean' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Nano Ocean
          </button>
          <button 
            onClick={() => setActiveTab('banana')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'banana' ? 'bg-yellow-400 text-amber-950 shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Nano Banana
          </button>
          <button 
            onClick={() => setActiveTab('minimalist')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'minimalist' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Minimalist Pro
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'ocean' && <OceanDesign isSyncing={isSyncing} fields={MOCK_FIELDS} />}
          {activeTab === 'banana' && <BananaDesign isSyncing={isSyncing} fields={MOCK_FIELDS} />}
          {activeTab === 'minimalist' && <MinimalistDesign isSyncing={isSyncing} fields={MOCK_FIELDS} />}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-8 right-8">
        <Button 
          onClick={() => setIsSyncing(!isSyncing)}
          className={`h-16 px-8 rounded-full shadow-2xl font-black text-lg gap-3 transition-all ${isSyncing ? 'bg-rose-500 animate-pulse' : 'bg-blue-600 hover:scale-105'}`}
        >
          {isSyncing ? <RefreshCcw className="animate-spin" /> : <Zap className="fill-current" />}
          {isSyncing ? 'Sincronizando...' : 'Probar Sincronización'}
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// 🌊 NANO OCEAN DESIGN
// ==========================================
function OceanDesign({ isSyncing, fields }: { isSyncing: boolean, fields: any[] }) {
  const stats = [
    { label: 'Operaciones', value: '0', sub: 'Historial Maestro', icon: RefreshCcw, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Tasa de Éxito', value: '100%', sub: 'Estabilidad RPC', icon: CheckCircle2, gradient: 'from-emerald-400 to-emerald-600' },
    { label: 'Items Sincronizados', value: '0', sub: 'Flujo de Datos', icon: LayoutGrid, gradient: 'from-violet-500 to-indigo-600' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Cards - Ocean Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-8 rounded-[2.5rem] overflow-hidden text-white shadow-xl shadow-${stat.gradient.split('-')[1]}-500/20`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
            <div className={`absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl`} />
            
            <div className="relative flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-white/70">{stat.label}</span>
                <div className="text-5xl font-black">{stat.value}</div>
                <Badge className="bg-white/20 border-0 text-white text-[10px] font-bold px-3">{stat.sub}</Badge>
              </div>
              <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Mapping Card */}
      <Card className="rounded-[2.5rem] border-blue-100 shadow-2xl shadow-blue-500/10 overflow-hidden bg-white/70 backdrop-blur-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Settings2 className="h-6 w-6" /> Matriz de Sincronización: Productos
            </h2>
            <p className="text-blue-100 font-medium">Control granular de flujo bidireccional de datos</p>
          </div>
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-1.5 rounded-full backdrop-blur-md">
            Odoo v17 Connected
          </Badge>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-12 gap-4 mb-6 px-6 py-4 bg-slate-900 rounded-2xl text-white/60 text-xs font-black uppercase tracking-tighter">
            <div className="col-span-5">Propiedad de Datos (DentalFlow / Odoo)</div>
            <div className="col-span-2 text-center">Visualizar</div>
            <div className="col-span-2 text-center">Leer</div>
            <div className="col-span-2 text-center">Escribir</div>
            <div className="col-span-1 text-right">Info</div>
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
              <motion.div 
                key={field.id}
                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,1)' }}
                className="grid grid-cols-12 items-center gap-4 p-5 rounded-3xl border border-blue-50 bg-white/50 shadow-sm transition-all"
              >
                <div className="col-span-1 h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Database className="h-5 w-5" />
                </div>
                <div className="col-span-4">
                  <div className="font-black text-slate-900">{field.label}</div>
                  <div className="text-xs font-bold text-blue-500 flex items-center gap-1">
                    <span className="opacity-50">ODOO ID:</span> {field.odoo}
                  </div>
                </div>

                {/* 👁️ VER */}
                <div className="col-span-2 flex justify-center">
                  <button className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${field.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                    <Eye className="h-5 w-5" />
                  </button>
                </div>

                {/* 📥 LEER */}
                <div className="col-span-2 flex justify-center">
                  <button className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${field.read ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                    <Download className="h-5 w-5" />
                  </button>
                </div>

                {/* 📤 ESCRIBIR */}
                <div className="col-span-2 flex justify-center">
                  <button className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${field.write ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                    {field.write ? <Edit3 className="h-5 w-5" /> : <Lock className="h-5 w-5 opacity-40" />}
                  </button>
                </div>

                <div className="col-span-1 flex justify-end">
                   <AlertCircle className="h-5 w-5 text-slate-300 hover:text-blue-500 cursor-help" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==========================================
// 🍌 NANO BANANA DESIGN
// ==========================================
function BananaDesign({ isSyncing, fields }: { isSyncing: boolean, fields: any[] }) {
  const stats = [
    { label: 'Operaciones', value: '0', sub: 'Historial Maestro', icon: RefreshCcw, color: 'from-yellow-400 to-orange-500' },
    { label: 'Tasa de Éxito', value: '100%', sub: 'Estabilidad RPC', icon: CheckCircle2, color: 'from-amber-400 to-yellow-600' },
    { label: 'Items Sincronizados', value: '0', sub: 'Flujo de Datos', icon: LayoutGrid, color: 'from-orange-400 to-amber-600' },
  ]

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Stats Cards - Banana Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05, rotate: -1 }}
            className={`p-1 rounded-[3rem] bg-gradient-to-br ${stat.color} shadow-2xl shadow-amber-500/20`}
          >
            <div className="bg-white rounded-[2.8rem] p-8 h-full relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5">
                 <stat.icon className="h-32 w-32" />
               </div>
               <div className="relative text-center space-y-2">
                 <div className="text-xs font-black uppercase tracking-widest text-amber-600">{stat.label}</div>
                 <div className="text-6xl font-black text-amber-950">{stat.value}</div>
                 <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-black rounded-full px-4">{stat.sub}</Badge>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visual Header */}
      <div className="relative h-48 rounded-[3rem] bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 overflow-hidden shadow-2xl flex items-center px-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="relative flex items-center gap-8">
          <div className="h-24 w-24 bg-white/30 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/50 shadow-inner">
             <LayoutGrid className="h-12 w-12 text-amber-950" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-amber-950 tracking-tighter">Odoo Matrix</h2>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-amber-950/10 border-amber-950/20 text-amber-950 font-black">7 CAMPOS ACTIVOS</Badge>
              <Badge className="bg-white/40 border-0 text-amber-950 font-black">2 PENDING SYNC</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Mapping Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <motion.div 
            key={field.id}
            whileHover={{ scale: 1.02, rotate: 1 }}
            className={`p-1 rounded-[2.5rem] bg-gradient-to-br transition-all ${field.sync ? 'from-yellow-400 to-amber-500' : 'from-slate-200 to-slate-300'}`}
          >
            <div className="bg-white rounded-[2.3rem] p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 leading-none">{field.label}</h3>
                   <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-10">{field.odoo}</span>
                 </div>
                 <div className={`h-6 w-6 rounded-full border-4 ${field.sync ? 'border-amber-400 bg-amber-500 shadow-lg shadow-amber-200' : 'border-slate-200 bg-slate-100'}`} />
              </div>

              <div className="bg-slate-50 p-4 rounded-3xl flex justify-around items-center border border-slate-100">
                <div className="text-center group cursor-pointer">
                  <div className={`p-3 rounded-2xl mb-1 flex items-center justify-center transition-all ${field.view ? 'bg-amber-100 text-amber-600' : 'text-slate-300'}`}>
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-amber-600">Visual</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center group cursor-pointer">
                  <div className={`p-3 rounded-2xl mb-1 flex items-center justify-center transition-all ${field.read ? 'bg-amber-100 text-amber-600' : 'text-slate-300'}`}>
                    <Download className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-amber-600">Lectura</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center group cursor-pointer">
                  <div className={`p-3 rounded-2xl mb-1 flex items-center justify-center transition-all ${field.write ? 'bg-amber-100 text-amber-600' : 'text-slate-300'}`}>
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-amber-600">Escritura</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 🏢 MINIMALIST PRO DESIGN (Table based)
// ==========================================
function MinimalistDesign({ isSyncing, fields }: { isSyncing: boolean, fields: any[] }) {
  const stats = [
    { label: 'Operaciones', value: '0', sub: 'Historial Maestro', icon: RefreshCcw },
    { label: 'Tasa de Éxito', value: '100%', sub: 'Estabilidad RPC', icon: CheckCircle2 },
    { label: 'Items Sincronizados', value: '0', sub: 'Flujo de Datos', icon: LayoutGrid },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats Cards - Minimalist Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border rounded-xl p-6 flex items-center gap-6 group hover:border-slate-900 transition-colors">
            <div className="h-14 w-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
               <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
              <div className="text-3xl font-bold text-slate-900 leading-none mb-1">{stat.value}</div>
              <div className="text-[10px] font-medium text-slate-500 italic">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configuración Técnica</h2>
              <p className="text-xs text-slate-500 font-medium italic">Modo para Usuarios Avanzados</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="relative">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <input type="text" placeholder="Buscar campo..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
             </div>
             <Button variant="outline" size="sm" className="gap-2 font-bold">
               <List className="h-4 w-4" /> Exportar CSV
             </Button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Campo DentalFlow</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Campo Odoo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-24">Vis</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-24">Sync</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-24">Mod</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{field.label}</div>
                  <div className="text-[10px] font-medium text-slate-400 tracking-wider">TYPE: {field.type}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{field.odoo}</code>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center">
                      <input type="checkbox" checked={field.view} readOnly className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center">
                      <input type="checkbox" checked={field.read} readOnly className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center">
                      <input type="checkbox" checked={field.write} readOnly className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Badge variant={field.sync ? "default" : "secondary"} className="font-bold text-[10px]">
                    {field.sync ? "ACTIVO" : "OFF"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
           <Button variant="ghost" className="font-bold">Descartar</Button>
           <Button className="bg-slate-900 text-white font-bold px-8">Guardar Cambios</Button>
        </div>
      </div>
    </div>
  )
}
