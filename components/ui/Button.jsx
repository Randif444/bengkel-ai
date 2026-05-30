import { cn } from "@/lib/utils";

/**
 * Reusable Button Component
 * Features a modern pill-shaped design (fully rounded) and glowing shadow effects.
 * 
 * @param {Object} props - Standard React props
 * @param {React.ReactNode} props.children - The label or icon inside the button
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - Determines the color scheme and shadow
 * @param {string} [props.className] - Optional Tailwind classes
 * @param {boolean} [props.disabled] - Disables interaction and reduces opacity
 * @returns {JSX.Element} The styled button element
 */
export function Button({ 
  children, 
  variant = "primary", 
  className, 
  disabled, 
  ...props 
}) {
  const baseStyles = "w-full rounded-full px-[20px] py-[14px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#1D9E75] text-white hover:bg-[#085041] shadow-[0_8px_20px_-6px_rgba(29,158,117,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(29,158,117,0.6)] transform hover:-translate-y-0.5",
    secondary: "bg-white text-[#1A1A1A] hover:bg-gray-50 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 rounded-[16px]"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}