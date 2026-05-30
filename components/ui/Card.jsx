import { cn } from "@/lib/utils";

/**
 * Reusable Card Component
 * Implements the Soft UI (Neumorphism) design pattern with a high border-radius
 * and subtle drop shadows to create a modern, floating elevation effect.
 *
 * @param {Object} props - Standard React props
 * @param {React.ReactNode} props.children - The content to be rendered inside the card
 * @param {string} [props.className] - Optional Tailwind classes to override or extend styles
 * @returns {JSX.Element} The styled card wrapper
 */
export function Card({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "bg-white rounded-[24px] p-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-white/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}