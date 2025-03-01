"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📋" },
    { name: "Projects", path: "/projects", icon: "📁" },
    { name: "Tasks", path: "/tasks", icon: "✓" },
    { name: "Calendar", path: "/calendar", icon: "📅" },
  ];

  return (
    <div className='h-screen w-64 bg-gray-900 text-white flex flex-col'>
      {/* Logo and App Name */}
      <div className='p-6 border-b border-gray-800'>
        <h1 className='text-xl font-bold'>Agile PM</h1>
        {user && (
          <p className='text-sm text-gray-400 mt-1 truncate'>{user.name}</p>
        )}
      </div>

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
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section with Profile and Logout */}
      <div className='p-4 border-t border-gray-800'>
        <Link
          href='/profile'
          className='flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2 transition-colors'
        >
          <span className='mr-3'>👤</span>
          Profile
        </Link>
        <button
          onClick={logout}
          className='flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-700 w-full transition-colors'
        >
          <span className='mr-3'>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
