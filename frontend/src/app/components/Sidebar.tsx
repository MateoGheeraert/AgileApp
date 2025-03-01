"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean | null>(null); // Start with null to avoid hydration issues

  // Load sidebar state from localStorage once on mount
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarOpen");
    if (storedState !== null) {
      setIsOpen(JSON.parse(storedState));
    } else {
      setIsOpen(true); // Default to open if no state is found
    }
  }, []);

  // Save sidebar state when it changes (but only if not null)
  useEffect(() => {
    if (isOpen !== null) {
      localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
    }
  }, [isOpen]);

  // Prevent rendering until state is loaded to avoid layout shift
  if (isOpen === null) return null;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📋" },
    { name: "Projecten", path: "/projects", icon: "📁" },
    { name: "Tickets", path: "/tasks", icon: "✓" },
    { name: "Kalender", path: "/calendar", icon: "📅" },
  ];

  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Toggle Button - Positioned Above Name */}
      <div className='p-4 flex justify-between items-center'>
        {isOpen && <h1 className='text-xl font-bold'>Agile PM</h1>}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className='p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition'
        >
          {isOpen ? (
            <EyeOff className='w-5 h-5 text-gray-400' />
          ) : (
            <Eye className='w-5 h-5 text-gray-400' />
          )}
        </button>
      </div>

      {/* User Info (Only Visible When Sidebar is Open) */}
      {isOpen && user && (
        <p className='text-sm text-gray-400 px-4 mt-1 truncate'>{user.name}</p>
      )}

      {/* Navigation Links */}
      <nav className='flex-grow p-4'>
        <ul className='space-y-2'>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primaryBlue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className='mr-3'>{item.icon}</span>
                {isOpen && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className='p-4 border-t border-gray-800'>
        <Link
          href='/profile'
          className='flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2 transition-colors'
        >
          <span className='mr-3'>👤</span>
          {isOpen && "Profiel"}
        </Link>
        <button
          onClick={logout}
          className='flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-700 w-full transition-colors'
        >
          <span className='mr-3'>🚪</span>
          {isOpen && "Log uit"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
