'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, TrendingUp, Package, ArrowUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Mock data
const stats = [
  {
    title: 'Pacientes Totales',
    value: '1,234',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    change: '+12%',
    changeColor: 'text-green-600',
  },
  {
    title: 'Pacientes Nuevos',
    value: '87',
    subtitle: 'Este mes',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    change: '+23%',
    changeColor: 'text-green-600',
  },
  {
    title: 'Citas del Mes',
    value: '342',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    change: '+8%',
    changeColor: 'text-green-600',
  },
  {
    title: 'Ingresos del Mes',
    value: 'Q 45,230',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    change: '+15%',
    changeColor: 'text-green-600',
  },
]

const labOrders = [
  {
    id: 'LAB-001',
    patient: 'María González',
    service: 'Corona de Porcelana',
    status: 'En camino',
    expectedDate: '2026-01-02',
    lab: 'Lab Dental Premium',
  },
  {
    id: 'LAB-002',
    patient: 'Carlos Méndez',
    service: 'Prótesis Parcial',
    status: 'Listo para recoger',
    expectedDate: '2026-01-01',
    lab: 'Lab Dental Premium',
  },
  {
    id: 'LAB-003',
    patient: 'Ana Rodríguez',
    service: 'Implante Dental',
    status: 'En camino',
    expectedDate: '2026-01-03',
    lab: 'Laboratorio Central',
  },
  {
    id: 'LAB-004',
    patient: 'Jorge Hernández',
    service: 'Blanqueamiento',
    status: 'Listo para recoger',
    expectedDate: '2025-12-31',
    lab: 'Lab Express',
  },
]

export default function MedicalDashboardPage() {
  // Revenue Chart (Bar Chart with rounded corners - Vuexy style)
  const revenueChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
      },
    },
    dataLabels: { enabled: false },
    colors: ['#10b981', '#ef4444'],
    xaxis: {
      categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        formatter: (val) => `Q ${val / 1000}k`,
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `Q ${val.toLocaleString()}`,
      },
    },
  }

  const revenueChartSeries = [
    {
      name: 'Ingresos',
      data: [12000, 15000, 10500, 7730],
    },
    {
      name: 'Gastos',
      data: [3500, 4200, 2800, 2000],
    },
  ]

  // Accounts Chart (Expected vs Collected by date)
  const accountsChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '55%',
      },
    },
    dataLabels: { enabled: false },
    colors: ['#3b82f6', '#10b981'],
    xaxis: {
      categories: ['15 Dic', '20 Dic', '25 Dic', '30 Dic', '05 Ene', '10 Ene'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        formatter: (val) => `Q ${val / 1000}k`,
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `Q ${val.toLocaleString()}`,
      },
    },
  }

  const accountsChartSeries = [
    {
      name: 'Esperado Cobrar',
      data: [8500, 12000, 9500, 15000, 11000, 13500],
    },
    {
      name: 'Cobrado',
      data: [7200, 10500, 8800, 13200, 9800, 11900],
    },
  ]

  // Payment Methods Chart (Donut Chart)
  const paymentMethodsOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              formatter: (val) => `${val}%`,
            },
            total: {
              show: true,
              label: 'Total Pagos',
              fontSize: '14px',
              fontWeight: 500,
              color: '#64748b',
              formatter: () => '342',
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}% de pagos`,
      },
    },
  }

  const paymentMethodsSeries = [45, 30, 20, 5]

  // Appointments Chart (Line Chart - Vuexy style)
  const appointmentsChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      dashArray: [0, 8],
    },
    colors: ['#8b5cf6', '#ef4444'],
    markers: {
      size: 6,
      strokeWidth: 3,
      strokeColors: '#fff',
      hover: {
        size: 8,
      },
    },
    xaxis: {
      categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} citas`,
      },
    },
  }

  const appointmentsChartSeries = [
    {
      name: 'Atendidas',
      data: [12, 15, 18, 14, 20, 8, 0],
    },
    {
      name: 'Canceladas',
      data: [2, 1, 3, 2, 1, 0, 0],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de tu clínica</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-400 mb-2">{stat.subtitle}</p>
                    )}
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <ArrowUp className={`h-3 w-3 ${stat.changeColor}`} />
                      <span className={`text-sm font-semibold ${stat.changeColor}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ingresos vs Gastos</CardTitle>
            <p className="text-sm text-gray-500">Reporte semanal</p>
          </CardHeader>
          <CardContent>
            <Chart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Accounts Chart - Expected vs Collected */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Esperado vs Cobrado</CardTitle>
            <p className="text-sm text-gray-500">Por fecha de vencimiento</p>
          </CardHeader>
          <CardContent>
            <Chart
              options={accountsChartOptions}
              series={accountsChartSeries}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Payment Methods Chart - NEW */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Medios de Pago</CardTitle>
            <p className="text-sm text-gray-500">Distribución de pagos</p>
          </CardHeader>
          <CardContent>
            <Chart
              options={paymentMethodsOptions}
              series={paymentMethodsSeries}
              type="donut"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Appointments Chart */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Citas Atendidas vs Canceladas</CardTitle>
          <p className="text-sm text-gray-500">Última semana</p>
        </CardHeader>
        <CardContent>
          <Chart
            options={appointmentsChartOptions}
            series={appointmentsChartSeries}
            type="line"
            height={350}
          />
        </CardContent>
      </Card>

      {/* Lab Orders Table */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Órdenes de Laboratorio Próximas
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Listas para recibir</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <Package className="h-3 w-3" />
              {labOrders.length} órdenes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Orden</TableHead>
                  <TableHead className="font-semibold">Paciente</TableHead>
                  <TableHead className="font-semibold">Servicio</TableHead>
                  <TableHead className="font-semibold">Laboratorio</TableHead>
                  <TableHead className="font-semibold">Fecha Esperada</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-mono text-sm font-medium">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.patient}</TableCell>
                    <TableCell className="text-gray-700">{order.service}</TableCell>
                    <TableCell className="text-sm text-gray-600">{order.lab}</TableCell>
                    <TableCell className="text-sm text-gray-700">{order.expectedDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === 'Listo para recoger' ? 'default' : 'secondary'}
                        className={
                          order.status === 'Listo para recoger'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
