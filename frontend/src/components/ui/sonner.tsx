import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      closeButton
      visibleToasts={3}
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "font-sans border border-hairline bg-carbon text-brand-text shadow-2xl rounded-xl",
          title: "font-semibold text-[13px]",
          description: "text-xs text-brand-muted",
          actionButton:
            "!bg-gold !text-obsidian font-mono !text-[11px] !font-bold uppercase tracking-wider",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
