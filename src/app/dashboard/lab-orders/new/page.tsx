import { Suspense } from 'react';
import OrderWizard from '@/components/lab/order-wizard';
import { getLabCatalog } from '@/actions/lab-orders';

export default async function NewLabOrderPage() {
  const catalog = await getLabCatalog();

  return (
    <div className="container mx-auto py-6 max-w-5xl">
       <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva Orden de Laboratorio</h1>
        <p className="text-slate-500 mt-2">
          Complete el formulario para enviar una solicitud de trabajo al laboratorio.
        </p>
      </div>
      
      <Suspense fallback={<div>Cargando catálogo...</div>}>
        <OrderWizard catalog={catalog} />
      </Suspense>
    </div>
  );
}
