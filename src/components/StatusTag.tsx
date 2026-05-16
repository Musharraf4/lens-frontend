import { Badge } from "@/components/ui/badge"
// import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { FaCheckCircle, FaExclamationCircle, FaInfo } from "react-icons/fa"
import { GoXCircleFill } from "react-icons/go";
import { cn } from "@/lib/utils"

export type StatusType = "default" | "success" | "error" | "warning"

interface StatusTagProps {
  type?: StatusType
  showIcon?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const statusConfig = {
  default: {
    icon: FaCheckCircle,
    className: "bg-[#F7F9FB] text-[#030C23] ",
  },
  success: {
    icon: FaCheckCircle,
    className: "bg-[#EAFFF5] text-[#0CD074] ",
  },
  error: {
    icon: GoXCircleFill,
    className: "bg-[#FFF0F1] text-[#F3293E]",
  },
  warning: {
    icon: FaExclamationCircle,
    className: "bg-[#FFF5E9] text-[#FB8F10] ",
  },
}

export function StatusTag({
  type = "default",
  showIcon = false,
  icon,
  children,
  className,
}: StatusTagProps) {
  const config = statusConfig[type]
  const Icon = config.icon

  return (
    <Badge 
      className={cn(
        "gap-1.5 font-medium rounded-full",
        "h-6 px-2",
        config.className,
        className
      )}
    >
      {showIcon && icon 
        ? icon 
        : showIcon?  <Icon size={14} /> : ""}
      {children}
    </Badge>
  )
}