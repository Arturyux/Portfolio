'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year: string;
}

export default function Home() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, PortfolioItem[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          throw new Error('Failed to fetch items');
        }
        const data: PortfolioItem[] = await res.json();
        setItems(data);

        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, PortfolioItem[]>);

        Object.keys(groupedData).forEach((cat) => {
          groupedData[cat].sort((a, b) => {
            const yearA = parseInt(a.year, 10) || 0;
            const yearB = parseInt(b.year, 10) || 0;
            return yearB - yearA;
          });
        });

        setGrouped(groupedData);
        setCategories(Object.keys(groupedData));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) {
        newSet.delete(cat);
      } else {
        newSet.add(cat);
      }
      return newSet;
    });
  };

  const selectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const selectedItem = items.find((item) => item.id === selectedItemId);

  return (
    <div className="flex flex-col mt-10 min-h-screen font-sans bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full">
        <nav className="bg-white w-full md:w-80 p-6  md:border-r border-gray-200 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link href="/admin">
                <button className="w-full px-4 py-3 text-left rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-medium">
                  Admin
                </button>
              </Link>
            </li>
            <li className="mt-4 font-semibold text-lg text-gray-700">Projects Categories</li>
            {loading ? (
              <li className="text-gray-500">Loading categories...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : categories.length === 0 ? (
              <li className="text-gray-500">No categories found.</li>
            ) : (
              categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full px-4 py-3 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex justify-between items-center font-medium text-gray-800"
                  >
                    {cat}
                    <span className="text-gray-600">{expandedCategories.has(cat) ? '-' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {expandedCategories.has(cat) && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 mt-1"
                      >
                        {grouped[cat].map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => selectItem(item.id)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedItemId === item.id
                                  ? 'bg-blue-100 text-blue-800 font-medium'
                                  : 'hover:bg-gray-100 text-gray-700'
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
        <main className="flex-1 p-6 md:p-8 bg-white">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{selectedItem.title} ({selectedItem.year || ''})</h2>
                <div
                  className="text-lg text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <img
                  src="https://img.goodfon.com/wallpaper/nbig/0/84/belaia-shveitsarskaia-ovcharka-sobaka-morda-tsvety-lavanda.webp"
                  alt="Berry is resting"
                  className="w-32 h-32 mb-4 rounded-full"
                />
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to Artur Burlakin Portfolio</h2>
                <p className="text-gray-600">Select a project from the left to view details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <footer className="bg-white py-6 w-full text-center text-gray-600 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-1">&copy; 2025 Burlakin</p>
          <p>by Artur Burlakin</p>
        </div>
      </footer>
    </div>
  );
}