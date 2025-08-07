'use client';

import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import { PortfolioItem } from '../../components/AdminItemList';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminContent() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, PortfolioItem[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const [newCategory, setNewCategory] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newYear, setNewYear] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
    }
  }, [isLoggedIn]);

  const fetchItems = async () => {
    setLoading(true);
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
      alert('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent, description: string) => {
    e.preventDefault();
    const optimisticItem = {
      id: 'temp-' + Date.now(),
      category: newCategory,
      title: newTitle,
      description,
      year: newYear,
    };
    setItems((prev) => [optimisticItem, ...prev]);
    setNewCategory('');
    setNewTitle('');
    setNewDescription('');
    setNewYear('');

    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory, title: newTitle, description, year: newYear }),
    });

    if (res.ok) {
      const addedItem = await res.json();
      setItems((prev) => prev.map((item) => (item.id === optimisticItem.id ? addedItem : item)));
      fetchItems();
    } else {
      setItems((prev) => prev.filter((item) => item.id !== optimisticItem.id));
      alert('Failed to add item');
    }
  };

  const startEditing = (item: PortfolioItem) => {
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditYear(item.year || '');
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string, description: string) => {
    e.preventDefault();
    const optimisticItem = { id, category: editCategory, title: editTitle, description, year: editYear };
    setItems((prev) => prev.map((item) => (item.id === id ? optimisticItem : item)));
    setEditingId(null);

    const res = await fetch(`/api/portfolio?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: editCategory, title: editTitle, description, year: editYear }),
    });

    if (!res.ok) {
      alert('Failed to edit item');
      fetchItems();
    } else {
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    setItems((prev) => prev.filter((item) => item.id !== id));

    const res = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });

    if (!res.ok) {
      alert('Failed to delete item');
      fetchItems();
    } else {
      fetchItems();
    }
  };

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

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded shadow-md max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard - Portfolio Management</h1>

        <div className="w-full mb-8" key="add-form">
          <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
          <AdminForm
            isEdit={false}
            category={newCategory}
            title={newTitle}
            year={newYear}
            description={newDescription}
            existingCategories={categories}
            onCategoryChange={setNewCategory}
            onTitleChange={setNewTitle}
            onYearChange={setNewYear}
            onSubmit={handleAddSubmit}
          />
        </div>

        <h2 className="text-2xl font-bold mb-4">Portfolio Items by Category</h2>
        {loading ? (
          <p>Loading...</p>
        ) : categories.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <ul className="w-full space-y-4">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full px-4 py-2 text-left rounded bg-gray-200 hover:bg-gray-300 flex justify-between items-center font-bold"
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
                      className="pl-4 space-y-4 mt-2"
                    >
                      {grouped[cat].map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full px-4 py-2 text-left rounded bg-white hover:bg-gray-200 flex justify-between items-center"
                          >
                            {item.title} ({item.year || ''})
                            <span>{expandedItems.has(item.id) ? '-' : '+'}</span>
                          </button>
                          <AnimatePresence>
                            {expandedItems.has(item.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 border border-gray-300 rounded-md mt-2"
                              >
                                {editingId === item.id ? (
                                  <AdminForm
                                    isEdit={true}
                                    category={editCategory}
                                    title={editTitle}
                                    year={editYear}
                                    description={editDescription}
                                    existingCategories={categories}
                                    onCategoryChange={setEditCategory}
                                    onTitleChange={setEditTitle}
                                    onYearChange={setEditYear}
                                    onSubmit={(e, description) => handleEditSubmit(e, item.id, description)}
                                    onCancel={() => setEditingId(null)}
                                  />
                                ) : (
                                  <>
                                    <div
                                      className="text-lg text-gray-700 mb-2"
                                      dangerouslySetInnerHTML={{ __html: item.description }}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => startEditing(item)}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setIsLoggedIn(false)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-8"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit} className="w-full max-w-md p-8 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}