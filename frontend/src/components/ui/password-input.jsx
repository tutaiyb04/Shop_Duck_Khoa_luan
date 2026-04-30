import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PasswordInput = React.forwardRef(function PasswordInput(
  { className, ...props },
  ref
) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative w-full">
      <Input
        {...props}
        ref={ref}
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        title={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        style={{ background: "transparent", border: 0, padding: 0, outline: "none", boxShadow: "none" }}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-md cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 group"
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
        ) : (
          <Eye className="h-4 w-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
        )}
      </button>
    </div>
  );
});

export { PasswordInput };
