import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-sm text-destructive hover:underline"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
