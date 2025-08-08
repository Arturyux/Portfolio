'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  year: string;
}

interface CategoryData {
  generalInfo: string;
  projects: PortfolioItem[];
}

export default function Home() {
  const [data, setData] = useState<Record<string, CategoryData>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const fetchedData = await res.json();
        setData(fetchedData);
        setCategories(Object.keys(fetchedData));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (cat: string) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
      setSelectedCategory(null);
    } else {
      setExpandedCategory(cat);
      setSelectedCategory(cat);
    }
    setSelectedItemId(null);
  };

  const selectItem = (id: string, cat: string) => {
    setSelectedItemId(id);
    setSelectedCategory(cat);
  };

  const renderMainContent = () => {
    if (selectedItemId && selectedCategory && data[selectedCategory]) {
      const selectedItem = data[selectedCategory].projects.find((item) => item.id === selectedItemId);
      if (selectedItem) {
        return (
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
        );
      }
    }

    if (selectedCategory && data[selectedCategory]) {
      return (
        <motion.div
          key={`general-${selectedCategory}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">General Information for {selectedCategory}</h2>
          <div
            className="text-lg text-gray-700 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: data[selectedCategory].generalInfo }}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="welcome"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <img
          src="/placeholder-dog.png"
          alt="Berry is resting"
          className="w-32 h-32 mb-4 rounded-full"
        />
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to Artur Burlakin Portfolio</h2>
        <p className="text-gray-600">Select a category or project from the left to view details.</p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white py-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-800">
          Artur Burlakin Portfolio
        </h1>
      </header>
      <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full">
        <nav className="bg-white w-full md:w-80 p-6 md:border-r border-gray-200 overflow-y-auto">
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
                    <span className="text-gray-600">{expandedCategory === cat ? '-' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {expandedCategory === cat && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 mt-1"
                      >
                        {data[cat].projects.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => selectItem(item.id, cat)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedItemId === item.id && selectedCategory === cat
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
            {renderMainContent()}
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