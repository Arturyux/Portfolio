'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="flex flex-col min-h-screen font-sans">
      <header className="bg-gray-800 text-white py-6 text-center">
        <h1 className="text-4xl font-bold tracking-[-0.01em]">
          Artur Burlakin Portfolio
        </h1>
      </header>
      <div className="flex flex-1 flex-col sm:flex-row">
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
                    onClick={() => toggleCategory(cat)}
                    className="w-full px-4 py-2 text-left rounded bg-white hover:bg-gray-200 flex justify-between items-center"
                  >
                    {cat}
                    <span>{expandedCategories.has(cat) ? '-' : '+'}</span>
                  </button>
                  {expandedCategories.has(cat) && (
                    <ul className="pl-4 space-y-2 mt-2">
                      {grouped[cat].map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => selectItem(item.id)}
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
                    </ul>
                  )}
                </li>
              ))
            )}
          </ul>
        </nav>
        <main className="flex-1 p-6">
          {selectedItem ? (
            <div>
              <h2 className="text-3xl font-bold mb-4">{selectedItem.title} ({selectedItem.year || ''})</h2>
              <p className="text-lg text-gray-700">{selectedItem.description}</p>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">Welcome to Artur Burlakin Portfolio</h2>
            </div>
          )}
        </main>
      </div>
      <footer className="bg-gray-50 border-t border-gray-200 py-6 w-full">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p className="mb-1">&copy; 2025 Burlakin</p>
          <p>by Artur Burlakin</p>
        </div>
      </footer>
    </div>
  );
}