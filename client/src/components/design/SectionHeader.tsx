import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  variant?: "primary" | "secondary" | "default";
  icon?: React.ReactNode;
  className?: string;
}

const variantMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  default: "bg-muted/60 text-foreground",
};

export function SectionHeader(props: SectionHeaderProps) {
  const { title, variant = "default", icon, className } = props;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-t-2xl px-4 py-3 font-medium",
        variantMap[variant],
        className
      )}
    >
      {icon && <span className="[&_svg]:size-5 shrink-0">{icon}</span>}
      <span>{title}</span>
    </div>
  );
}
