"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const contentStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  maxWidth: "32rem",
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  maxHeight: "85vh",
  overflowY: "auto",
  backgroundColor: "var(--color-background, #fff)",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.12)",
  borderTop: "1px solid var(--color-border, #e5e5e5)",
  outline: "none",
  animation: "slideUp 0.3s ease-out",
};

const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    style={{ ...overlayStyle, ...style }}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, style, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      style={{ ...contentStyle, ...style }}
      className={className}
      {...props}
    >
      <div
        style={{
          width: 48,
          height: 6,
          borderRadius: 3,
          backgroundColor: "var(--color-muted, #f5f5f5)",
          margin: "16px auto 0",
        }}
      />
      <div style={{ padding: "16px 24px 24px" }}>{children}</div>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

function SheetHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{ marginBottom: 16 }}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <SheetPrimitive.Title
      className={className}
      style={{ fontSize: "1.125rem", fontWeight: 600 }}
    >
      {children}
    </SheetPrimitive.Title>
  );
}

function SheetDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <SheetPrimitive.Description
      className={className}
      style={{
        fontSize: "0.875rem",
        color: "var(--color-muted-foreground, #737373)",
        marginTop: 4,
      }}
    >
      {children}
    </SheetPrimitive.Description>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
