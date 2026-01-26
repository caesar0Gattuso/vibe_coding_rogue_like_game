import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// Directly use React.ComponentProps<typeof motion.button>
type ButtonProps = React.ComponentProps<typeof motion.button> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const variants = {
    primary: "bg-blue-500 text-white active:bg-blue-600",
    secondary: "bg-white/10 text-white active:bg-white/20 backdrop-blur-md",
    danger: "bg-red-500 text-white active:bg-red-600",
    ghost: "bg-transparent text-white/80 hover:text-white active:bg-white/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3.5 text-lg",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(
        "rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
