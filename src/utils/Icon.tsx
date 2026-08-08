import type { LucideIcon, LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({ icon: LucideComponent, size = 20, strokeWidth = 2, className = "", ...props }: IconProps) {
  return (
    <LucideComponent 
      size={size} 
      strokeWidth={strokeWidth} 
      className={`shrink-0 ${className}`} 
      {...props} 
    />
  );
}