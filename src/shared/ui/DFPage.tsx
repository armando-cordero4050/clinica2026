import { cn } from "@/shared/lib/utils";

interface DFPageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DFPage({ children, className, ...props }: DFPageProps) {
    return (
        <div className={cn("p-6 space-y-6 max-w-7xl mx-auto w-full", className)} {...props}>
            {children}
        </div>
    );
}
