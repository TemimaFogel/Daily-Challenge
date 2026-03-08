import { Bell, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type NotificationItem } from "@/features/notifications/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  useDropdownMenu,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationItem;
  onNavigate: () => void;
}) {
  const ctx = useDropdownMenu();
  const timeAgo = item.createdAt
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
    : null;

  const handleClick = () => {
    ctx?.setOpen(false);
    onNavigate();
  };

  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-sm px-2 py-2.5 text-left text-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors"
      )}
      onClick={handleClick}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-500">
        <Mail className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="truncate text-muted-foreground">{item.message}</p>
        {timeAgo && (
          <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
        )}
      </div>
    </button>
  );
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const { notifications, newCount, markAsSeen } = useNotifications();


  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Notifications"
      >
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {newCount > 0 && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full",
                "bg-fuchsia-500 text-xs font-bold text-white"
              )}
            >
              {newCount > 99 ? "99+" : newCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] p-0"
        onOpenChange={(open) => open && markAsSeen()}
      >
        <div className="border-b border-border px-3 py-2">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No new notifications
            </p>
          ) : (
            notifications.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onNavigate={() => navigate(item.href)}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
