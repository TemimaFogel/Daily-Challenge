import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

function SheetTrigger({ asChild, children, className }: SheetTriggerProps) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement;
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...child.props,
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        ctx.onOpenChange(true);
      },
      className: cn(className, child.props.className),
    });
  }
  return (
    <button type="button" onClick={() => ctx.onOpenChange(true)} className={className}>
      {children}
    </button>
  );
}

interface SheetContentProps {
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

function SheetContent({
  side = "left",
  children,
  className,
}: SheetContentProps) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  const { open, onOpenChange } = ctx;

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 z-50 w-[260px] bg-sidebar border-r border-border shadow-lg flex flex-col transition-transform duration-200 ease-out",
          side === "left" ? "left-0" : "right-0",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export { Sheet, SheetTrigger, SheetContent };
