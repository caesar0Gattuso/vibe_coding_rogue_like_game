import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// Directly use React.ComponentProps<typeof motion.div> which includes all Motion props
type GlassCardProps = React.ComponentProps<typeof motion.div> & {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
};

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  variant = 'dark',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-2xl border border-white/10 shadow-lg backdrop-blur-xl",
        variant === 'dark' ? "bg-black/40" : "bg-white/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
