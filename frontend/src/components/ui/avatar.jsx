import React, { useState } from "react";
import { cn } from "cn";

function Avatar({ className, ...props }) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-300/40 shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, src, alt = "", ...props }) {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) return null;

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-black font-extrabold text-xs select-none shadow-inner",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
