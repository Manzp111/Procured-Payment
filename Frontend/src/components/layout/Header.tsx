// src/components/layout/Header.tsx
import { useState } from 'react';
import type { User } from '../../types';
import { BellIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ user, sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Bars3Icon className="h-6 w-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-green-600">ProcurePay</h1>
        </div>

        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search requests, vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-1 text-gray-500 hover:text-gray-700">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </div>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-700">{user.first_name}</p>
              <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;