'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year: string;
}

interface SidebarProps {
  grouped: Record<string, PortfolioItem[]>;
  categories: string[];
  expandedCategories: Set<string>;
  selectedItemId: string | null;
  loading: boolean;
  error: string | null;
  onToggleCategory: (cat: string) => void;
  onSelectItem: (id: string) => void;
}

export default function Sidebar({
  grouped,
  categories,
  expandedCategories,
  selectedItemId,
  loading,
  error,
  onToggleCategory,
  onSelectItem,
}: SidebarProps) {
  return (
    <nav className="bg-gray-100 w-full sm:w-64 p-6 border-r border-gray-200">
      <ul className="space-y-4">
        <li>
          <Link href="/admin">
            <button className="w-full px-4 py-2 text-left rounded bg-gray-500 text-white hover:bg-gray-600">
              Admin
            </button>
          </Link>
        </li>
        <li className="mt-4 font-bold text-lg">Projects Categories</li>
        {loading ? (
          <li>Loading categories...</li>
        ) : error ? (
          <li className="text-red-500">{error}</li>
        ) : categories.length === 0 ? (
          <li>No categories found.</li>
        ) : (
          categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => onToggleCategory(cat)}
                className="w-full px-4 py-2 text-left rounded bg-white hover:bg-gray-200 flex justify-between items-center"
              >
                {cat}
                <span>{expandedCategories.has(cat) ? '-' : '+'}</span>
              </button>
              <AnimatePresence>
                {expandedCategories.has(cat) && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pl-4 space-y-2 mt-2"
                  >
                    {grouped[cat].map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => onSelectItem(item.id)}
                          className={`w-full text-left px-2 py-1 rounded ${
                            selectedItemId === item.id
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          {item.title} ({item.year || ''})
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))
        )}
      </ul>
    </nav>
  );
}