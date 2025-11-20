"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "./utils";

// ROOT
export function Dialog({ children, ...props }) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

// TRIGGER
export function DialogTrigger({ children, ...props }) {
  return (
    <DialogPrimitive.Trigger asChild {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

// OVERLAY (TIDAK TRANSPARAN)
export function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  );
}

// CONTENT (FIX POSISI + TIDAK TRANSPARAN + RESPONSIF + SCROLL)
export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />

      <DialogPrimitive.Content
        {...props}
        className={cn(
          // // posisi TEPAT DI TENGAH
          // "fixed z-50",
          // "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",

          // // styling kotak
          // "!bg-white rounded-xl border shadow-2xl",

          // // ukuran
          // "w-[95%] md:w-[650px]",

          // // height & scroll
          // "max-h-[90vh] overflow-y-auto",

          // // tambah padding
          // "p-6",

          // POSISI DI TENGAH LAYAR
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",

          // BACKGROUND SOLID (TIDAK TRANSPARAN)
          "bg-popover border border-border",

          // STYLING
          "rounded-lg shadow-lg",

          // UKURAN RESPONSIF
          "w-[90vw] max-w-[500px] max-h-[85vh]",
          "md:w-[600px] md:max-w-[600px]",

          // SCROLL JIKA KONTEN PANJANG
          "max-h-[90vh] overflow-y-auto",

          // tambah padding
          "p-6",
          className
        )}
      >
        {/* wrapper scroll */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>

        {/* close button */}
        {/* <DialogPrimitive.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100">
          <XIcon className="size-4" />
        </DialogPrimitive.Close> */}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// HEADER
export function DialogHeader({ className, ...props }) {
  return (
    <div className={cn("mb-4 flex flex-col gap-2", className)} {...props} />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("text-xl font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div className={cn("flex justify-end gap-3 mt-4", className)} {...props} />
  );
}
