import { cn } from "@/shared/lib/utils";

interface DFCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DFCard({ children, className, ...props }: DFCardProps) {
    return (
        <div
            className={cn("bg-card text-card-foreground rounded-lg border shadow-sm", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function DFCardHeader({ children, className, ...props }: DFCardProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
            {children}
        </div>
    );
}

export function DFCardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
            {children}
        </h3>
    );
}

export function DFCardContent({ children, className, ...props }: DFCardProps) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
            {children}
        </div>
    );
}
