import { cn } from "@/shared/lib/utils";

interface DFSectionHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function DFSectionHeader({ title, description, actions, className }: DFSectionHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between space-y-2 mb-6", className)}>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
    );
}
