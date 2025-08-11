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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [categoryScales, setCategoryScales] = useState<Record<string, number>>({});
  const [projectScales, setProjectScales] = useState<Record<string, number>>({});
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
        const initialCatScales: Record<string, number> = {};
        Object.keys(fetchedData).forEach((cat) => {
          initialCatScales[cat] = 1;
        });
        setCategoryScales(initialCatScales);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (cat: string) => {
    setActiveCategory((prev) => {
      const isActive = prev === cat;
      const newActive = isActive ? null : cat;
      const resetScales: Record<string, number> = {};
      Object.keys(categoryScales).forEach((c) => {
        resetScales[c] = 1;
      });
      if (!isActive) {
        resetScales[cat] = 1.15;
      }
      setCategoryScales(resetScales);
      return newActive;
    });
    setActiveProject(null);
    setProjectScales({});
  };

  const selectProject = (id: string) => {
    setActiveProject((prev) => {
      const isActive = prev === id;
      const resetScales: Record<string, number> = {};
      Object.keys(projectScales).forEach((pid) => {
        resetScales[pid] = 1;
      });
      if (!isActive) {
        resetScales[id] = 1.15;
      }
      setProjectScales(resetScales);
      return isActive ? null : id;
    });
  };

  const handleCategoryHover = (cat: string, hover: boolean) => {
    if (activeCategory !== cat) {
      setCategoryScales((prev) => ({
        ...prev,
        [cat]: hover ? 1.15 : 1,
      }));
    }
  };

  const handleProjectHover = (id: string, hover: boolean) => {
    if (activeProject !== id) {
      setProjectScales((prev) => ({
        ...prev,
        [id]: hover ? 1.15 : 1,
      }));
    }
  };

  const renderMainContent = () => {
    if (activeProject && activeCategory && data[activeCategory]) {
      const selectedItem = data[activeCategory].projects.find(
        (p) => p.id === activeProject
      );
      if (selectedItem) {
        return (
          <motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {selectedItem.title} ({selectedItem.year || ''})
            </h2>
            <div
              className="text-lg text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: selectedItem.description,
              }}
            />
          </motion.div>
        );
      }
    }
    if (activeCategory && data[activeCategory]) {
      return (
        <motion.div
          key={`general-${activeCategory}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            General Information on {activeCategory}
          </h2>
          <div
            className="text-lg text-gray-700 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: data[activeCategory].generalInfo,
            }}
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
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <img
          src="/placeholder-dog.png"
          alt="Berry is resting"
          className="w-32 h-32 mb-4 rounded-full"
        />
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          Welcome to Artur Burlakin Portfolio
        </h2>
        <p className="text-gray-600">
          Select a category or project from the left to view details.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col mt-30 mx-50 min-h-screen font-sans bg-gradient-to-b bg-white">
      <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full">
        <nav className="bg-white w-full md:w-80 p-6 md:border-r border-gray-200 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link href="/admin">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="w-full px-4 py-3 text-left rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                >
                  Admin
                </motion.button>
              </Link>
            </li>
            {loading ? (
              <li className="text-gray-500">Loading categories...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : categories.length === 0 ? (
              <li className="text-gray-500">No categories found.</li>
            ) : (
              categories.map((cat) => (
                <li key={cat} className={activeCategory === cat ? 'mb-4' : 'mb-2'}>
                  <motion.button
                    onClick={() => toggleCategory(cat)}
                    onMouseEnter={() => handleCategoryHover(cat, true)}
                    onMouseLeave={() => handleCategoryHover(cat, false)}
                    animate={{ scale: categoryScales[cat] || 1 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="w-full flex items-right justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
                  >
                    {cat}
                    <span className="text-gray-600">
                      {activeCategory === cat ? '-' : '+'}
                    </span>
                  </motion.button>
                  <AnimatePresence>
                    {activeCategory === cat && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0, scaleY: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
                        exit={{ opacity: 0, height: 0, scaleY: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="pl-4 space-y-4 mt-2 origin-top"
                      >
                        {data[cat].projects.map((item) => (
                          <li key={item.id}>
                            <motion.button
                              onClick={() => selectProject(item.id)}
                              onMouseEnter={() => handleProjectHover(item.id, true)}
                              onMouseLeave={() => handleProjectHover(item.id, false)}
                              animate={{ scale: projectScales[item.id] || 1 }}
                              transition={{
                                duration: 0.2,
                                ease: 'easeInOut',
                              }}
                              className="w-full flex items-right justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
                            >
                              <span>{item.title}</span>
                              {item.year && <span>({item.year})</span>}
                            </motion.button>
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
          <AnimatePresence mode="wait">{renderMainContent()}</AnimatePresence>
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