"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * Bottom Navigation Component
 * Provides mobile app-like routing. Features a floating container design
 * with an active state dot indicator for enhanced UX.
 *
 * @returns {JSX.Element} Fixed bottom navigation bar
 */
export function BottomNav() {
  const pathname = usePathname();
  
  // Hydration Fix: Ensure the component is mounted in the browser 
  // before rendering dynamic route states.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Diagnosis', path: '/diagnosis', icon: PenTool },
    { name: 'Pesan WA', path: '/pesan', icon: MessageSquare },
    { name: 'Laporan', path: '/laporan', icon: FileText },
  ];

  // Render a neutral/inactive state during Server-Side Rendering (SSR).
  // This guarantees the server HTML perfectly matches the initial client HTML.
  if (!isMounted) {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] bg-white rounded-t-[30px] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] flex justify-around items-center z-50 px-2 pb-2 pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="flex flex-col items-center justify-center w-full h-full space-y-1">
               <Icon className="w-6 h-6 text-gray-400" />
               <span className="text-[10px] font-bold text-gray-400">{item.name}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] bg-white rounded-t-[30px] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] flex justify-around items-center z-50 px-2 pb-2 pt-1">
      {navItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
          >
            {/* Active state indicator (Floating Dot) */}
            {isActive && (
              <span className="absolute -top-1 w-1.5 h-1.5 bg-[#1D9E75] rounded-full"></span>
            )}
            
            <Icon className={cn("w-6 h-6 transition-all duration-300", isActive ? "text-[#1D9E75] transform -translate-y-0.5" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold transition-colors", isActive ? "text-[#1D9E75]" : "text-gray-400")}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}