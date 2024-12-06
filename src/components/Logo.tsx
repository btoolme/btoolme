import React from 'react';
import { Wrench } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-1.5 shadow-md">
        <Wrench className="w-6 h-6 text-white" />
      </div>
      <span className="font-extrabold text-3xl text-gray-900 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">b</span>
        tool
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">me</span>
      </span>
    </div>
  );
}
