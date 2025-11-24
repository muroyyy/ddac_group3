// Minimal components to resolve build errors
import * as React from "react";
import { cn } from "../../lib/utils";

// Simple Badge component
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground", 
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-input"
    };
    
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}
        {...props}
      />
    );
  }
);

// Simple Input component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

// Simple Label component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium leading-none", className)}
        {...props}
      />
    );
  }
);

// Simple Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

// Simple Select components
export const Select = ({ children }: any) => (
  <div className="relative">{children}</div>
);

export const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm", className)}
      {...props}
    >
      {children}
    </button>
  )
);

export const SelectValue = ({ placeholder }: any) => (
  <span className="text-muted-foreground">{placeholder}</span>
);

export const SelectContent = ({ children }: any) => (
  <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
    {children}
  </div>
);

export const SelectItem = ({ children }: any) => (
  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none">
    {children}
  </div>
);

// Simple Dialog components
export const Dialog = ({ open, children }: any) => (
  open ? <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">{children}</div> : null
);

export const DialogContent = ({ children, className }: any) => (
  <div className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg", className)}>
    {children}
  </div>
);

export const DialogHeader = ({ children }: any) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>
);

export const DialogTitle = ({ children }: any) => (
  <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>
);

export const DialogDescription = ({ children }: any) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);