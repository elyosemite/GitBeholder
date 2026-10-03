import { useThemePreference } from "@/features/settings"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // The app's own theme store (Settings), not next-themes.
  const [theme] = useThemePreference()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-icon-md" />
        ),
        info: (
          <InfoIcon className="size-icon-md" />
        ),
        warning: (
          <TriangleAlertIcon className="size-icon-md" />
        ),
        error: (
          <OctagonXIcon className="size-icon-md" />
        ),
        loading: (
          <Loader2Icon className="size-icon-md animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
