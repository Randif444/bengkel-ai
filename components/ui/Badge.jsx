import { cn } from "@/lib/utils";

/**
 * Reusable Badge Component
 * Used for displaying operational statuses (e.g., proses, selesai) 
 * and AI-generated priorities (e.g., utama, opsional) using distinct color palettes.
 */
export function Badge({ children, variant = "proses", className }) {
  const variants = {
    proses: "bg-[#FEF3C7] text-[#92400E]", 
    selesai: "bg-[#D1FAE5] text-[#065F46]",
    utama: "bg-red-100 text-red-700", 
    disarankan: "bg-blue-100 text-blue-700", 
    opsional: "bg-gray-100 text-gray-700" 
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}