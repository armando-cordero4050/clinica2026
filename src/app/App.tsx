import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Router } from '@/app/Router';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Router />
                <Toaster />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
