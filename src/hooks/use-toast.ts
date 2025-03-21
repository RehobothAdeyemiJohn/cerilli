
import { createContext, useContext, useState } from "react";
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

export type {
  ToastProps,
  ToastActionElement,
};

const ToastContext = createContext<{
  toast: (props: {
    title?: string;
    description?: string;
    action?: ToastActionElement;
    variant?: "default" | "destructive";
  }) => void;
  toasts: ToastProps[];
}>({
  toast: () => {},
  toasts: [],
});

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    const handleToast = (props: {
      title?: string;
      description?: string;
      action?: ToastActionElement;
      variant?: "default" | "destructive";
    }) => {
      // Fallback implementation
      console.log("Toast triggered:", props);
      
      // Create a DOM toast if we're outside of the context
      if (typeof document !== "undefined") {
        const toastEl = document.createElement("div");
        toastEl.className = "fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-md border z-50";
        toastEl.style.maxWidth = "350px";
        
        // Add variant styles
        if (props.variant === "destructive") {
          toastEl.className += " border-red-500";
        }
        
        if (props.title) {
          const titleEl = document.createElement("h3");
          titleEl.className = "font-medium text-sm";
          titleEl.textContent = props.title;
          toastEl.appendChild(titleEl);
        }
        
        if (props.description) {
          const descEl = document.createElement("p");
          descEl.className = "text-sm text-gray-500 mt-1";
          descEl.textContent = props.description;
          toastEl.appendChild(descEl);
        }
        
        document.body.appendChild(toastEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          if (document.body.contains(toastEl)) {
            document.body.removeChild(toastEl);
          }
        }, 5000);
      }
    };
    
    return {
      toast: handleToast,
      toasts: [],
    };
  }
  
  return context;
};

export const toast = ({
  title,
  description,
  action,
  variant = "default",
}: {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}) => {
  // Ensure toast is logged
  console.log("Direct toast triggered:", { title, description, variant });
  
  // Create a DOM toast
  if (typeof document !== "undefined") {
    const toastEl = document.createElement("div");
    toastEl.className = "fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-md border z-50";
    toastEl.style.maxWidth = "350px";
    
    // Add variant styles
    if (variant === "destructive") {
      toastEl.className += " border-red-500";
    }
    
    if (title) {
      const titleEl = document.createElement("h3");
      titleEl.className = "font-medium text-sm";
      titleEl.textContent = title;
      toastEl.appendChild(titleEl);
    }
    
    if (description) {
      const descEl = document.createElement("p");
      descEl.className = "text-sm text-gray-500 mt-1";
      descEl.textContent = description;
      toastEl.appendChild(descEl);
    }
    
    document.body.appendChild(toastEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 5000);
  }
};
