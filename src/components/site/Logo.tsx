import logo from "@/assets/vertex-logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <img
      src={logo}
      alt="Vertex Dev"
      width={762}
      height={230}
      className={cn("h-8 w-auto", inverted && "invert", className)}
    />
  );
}
