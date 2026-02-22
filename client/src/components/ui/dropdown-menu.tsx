import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

interface DropdownMenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuTrigger({ asChild, children, className }: DropdownMenuTriggerProps) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement;
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...child.props,
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        ctx.setOpen(!ctx.open);
      },
      "aria-expanded": ctx.open,
      "aria-haspopup": "menu",
      className: cn(className, child.props.className),
    });
  }
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      aria-expanded={ctx.open}
      aria-haspopup="menu"
      className={className}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const ctx = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ctx?.open, ctx]);

  if (!ctx?.open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        "top-full",
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  children,
  asChild,
  className,
  onSelect,
  ...props
}: (React.AnchorHTMLAttributes<HTMLAnchorElement> | React.ButtonHTMLAttributes<HTMLButtonElement>) & {
  asChild?: boolean;
  onSelect?: () => void;
}) {
  const ctx = React.useContext(DropdownMenuContext);
  const handleClick = (e: React.MouseEvent) => {
    onSelect?.();
    ctx?.setOpen(false);
    (props as React.ButtonHTMLAttributes<HTMLButtonElement>).onClick?.(e);
  };
  const itemClass = cn(
    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    className
  );
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>, {
      onClick: handleClick,
      className: cn(itemClass, (children as React.ReactElement).props.className),
    });
  }
  const href = (props as React.AnchorHTMLAttributes<HTMLAnchorElement>).href;
  if (href != null && href !== "") {
    return (
      <a role="menuitem" {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} onClick={handleClick} className={itemClass}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" role="menuitem" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} onClick={handleClick} className={itemClass}>
      {children}
    </button>
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
