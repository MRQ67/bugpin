"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  size?: "sm" | "md" | "lg";
}

export default function SearchBar({ size = "md" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usp = new URLSearchParams(params.toString());
    if (q.trim()) usp.set("q", q.trim());
    else usp.delete("q");
    router.push(`${pathname}?${usp.toString()}`);
  };

  const sizeClasses = {
    sm: {
      input: "h-8 text-sm",
      button: "h-6 w-8",
      icon: "h-4 w-4", 
      baseW: "w-28 md:w-40",
      focusW: "w-60 md:w-80",
    },
    md: {
      input: "h-10",
      button: "h-8 w-10",
      icon: "h-5 w-5",
      baseW: "w-32 md:w-48",
      focusW: "w-72 md:w-[28rem]",
    },
    lg: {
      input: "h-12 text-lg",
      button: "h-10 w-12",
      icon: "h-6 w-6",
      baseW: "w-40 md:w-56",
      focusW: "w-80 md:w-[32rem]",
    },
  } as const;

  const widthClass = focused ? sizeClasses[size].focusW : sizeClasses[size].baseW;
  const buttonSize = sizeClasses[size].button;
  const iconSize = sizeClasses[size].icon;

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`relative flex items-center transition-all duration-200 ${widthClass}`}
      >
        <Input
          type="search"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-full border-transparent bg-white pl-6 pr-1 shadow-md placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent ${sizeClasses[size].input}`}
        />
        <button
          type="submit"
          className={`absolute inset-y-1 right-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 aspect-square ${sizeClasses[size].input.includes('h-8') ? 'w-6' : sizeClasses[size].input.includes('h-10') ? 'w-8' : 'w-10'}`}
        >
          <Search className={iconSize} />
        </button>
      </div>
    </form>
  );
}
