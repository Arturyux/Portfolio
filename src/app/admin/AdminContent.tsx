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
  const [data, setData] = useState<Record<string, { generalInfo: string; projects: PortfolioItem[] }>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingCategoryInfo, setEditingCategoryInfo] = useState<string | null>(null);
  const [editGeneralInfo, setEditGeneralInfo] = useState<string>('');
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
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const fetchedData = await res.json();
      setData(fetchedData);
      setCategories(Object.keys(fetchedData));
    } catch (err) {
      alert('Failed to fetch data');
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
    if (!newCategory) {
      alert('Please select or enter a category');
      return;
    }
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory, title: newTitle, description, year: newYear }),
    });

    if (res.ok) {
      setNewCategory('');
      setNewTitle('');
      setNewDescription('');
      setNewYear('');
      fetchData();
    } else {
      alert('Failed to add item');
    }
  };

  const startEditing = (item: PortfolioItem, category: string) => {
    setEditingId(item.id);
    setEditCategory(category);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditYear(item.year || '');
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string, description: string) => {
    e.preventDefault();
    const res = await fetch(`/api/portfolio?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: editCategory, title: editTitle, description, year: editYear }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchData();
    } else {
      alert('Failed to edit item');
    }
  };

  const handleDelete = async (id: string, category: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const res = await fetch(`/api/portfolio?id=${id}&category=${category}`, { method: 'DELETE' });

    if (res.ok) {
      fetchData();
    } else {
      alert('Failed to delete project');
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!confirm('Are you sure you want to delete this category and all its projects?')) return;

    const res = await fetch(`/api/portfolio?category=${cat}`, { method: 'DELETE' });

    if (res.ok) {
      fetchData();
    } else {
      alert('Failed to delete category');
    }
  };

  const startEditingCategoryInfo = (cat: string) => {
    setEditingCategoryInfo(cat);
    setEditGeneralInfo(data[cat].generalInfo);
  };

  const handleCategoryInfoSubmit = async (cat: string) => {
    const res = await fetch('/api/portfolio?type=generalInfo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, generalInfo: editGeneralInfo }),
    });

    if (res.ok) {
      setEditingCategoryInfo(null);
      fetchData();
    } else {
      alert('Failed to update general info');
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
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex-1 px-4 py-2 text-left rounded bg-gray-200 hover:bg-gray-300 flex justify-between items-center font-bold"
                  >
                    {cat}
                    <span>{expandedCategories.has(cat) ? '-' : '+'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete Category
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCategories.has(cat) && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pl-4 space-y-4 mt-2"
                    >
                      {/* General Info */}
                      <div className="p-4 border border-gray-300 rounded-md">
                        <h3 className="font-semibold mb-2">General Information</h3>
                        {editingCategoryInfo === cat ? (
                          <div>
                            <textarea
                              value={editGeneralInfo}
                              onChange={(e) => setEditGeneralInfo(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleCategoryInfoSubmit(cat)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingCategoryInfo(null)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-700 mb-2">{data[cat].generalInfo || 'No general info set.'}</p>
                            <button
                              onClick={() => startEditingCategoryInfo(cat)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit General Info
                            </button>
                          </>
                        )}
                      </div>

                      {/* Projects */}
                      {data[cat].projects.map((item) => (
                        <li key={item.id} className="p-4 border border-gray-300 rounded-md">
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
                              <p><strong>Title:</strong> {item.title} ({item.year || ''})</p>
                              <div
                                className="text-lg text-gray-700 mb-2"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditing(item, cat)}
                                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, cat)}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
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