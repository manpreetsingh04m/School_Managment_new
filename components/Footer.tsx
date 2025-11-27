import React from "react";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={`w-full py-6 text-center text-xs sm:text-sm text-gray-500 ${className || ""}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Powered by Tadbhav</span>
        </div>
      </div>
    </footer>
  );
}


