'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { PortfolioItem } from '../components/AdminItemList';

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
        <Sidebar
          grouped={grouped}
          categories={categories}
          expandedCategories={expandedCategories}
          selectedItemId={selectedItemId}
          loading={loading}
          error={error}
          onToggleCategory={toggleCategory}
          onSelectItem={selectItem}
        />
        <MainContent selectedItem={selectedItem} />
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