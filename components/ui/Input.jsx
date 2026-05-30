import { cn } from "@/lib/utils";

/**
 * Reusable Input Component
 * Optimized for mobile-first applications. Forces a minimum font size of 16px on mobile
 * to prevent iOS Safari auto-zoom behavior. Hardcodes text and background colors 
 * to prevent OS-level Dark Mode conflicts.
 *
 * @param {Object} props - Standard input props
 * @param {string} [props.label] - Optional field label displayed above the input
 * @param {string} [props.error] - Optional error message displayed below the input
 * @returns {JSX.Element} The styled input field wrapper
 */
export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-bold text-[#1A1A1A] ml-1">{label}</label>}
      <input 
        className={cn(
          "w-full bg-[#F8FAFC] rounded-[16px] border-2 border-transparent px-[16px] py-[12px] text-[16px] sm:text-[14px] text-[#1A1A1A] placeholder:text-gray-400 outline-none focus:border-[#1D9E75]/30 focus:bg-white focus:shadow-[0_4px_20px_-4px_rgba(29,158,117,0.15)] transition-all",
          error && "border-red-400 focus:border-red-500 bg-red-50 focus:bg-white",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-red-500 ml-1">{error}</span>}
    </div>
  );
}

/**
 * Reusable Textarea Component
 * Shares the same design language and mobile optimizations as the Input component,
 * but implements a minimum height for multiline text entries.
 */
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-bold text-[#1A1A1A] ml-1">{label}</label>}
      <textarea 
        className={cn(
          "w-full bg-[#F8FAFC] rounded-[16px] border-2 border-transparent px-[16px] py-[12px] text-[16px] sm:text-[14px] text-[#1A1A1A] placeholder:text-gray-400 outline-none focus:border-[#1D9E75]/30 focus:bg-white focus:shadow-[0_4px_20px_-4px_rgba(29,158,117,0.15)] transition-all min-h-[120px]",
          error && "border-red-400 focus:border-red-500 bg-red-50 focus:bg-white",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-red-500 ml-1">{error}</span>}
    </div>
  );
}