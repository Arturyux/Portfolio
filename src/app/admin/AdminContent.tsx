'use client';

import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import AdminItemList from '../../components/AdminItemList';
import { PortfolioItem } from '../../components/AdminItemList';

export default function AdminContent() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);
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
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      let data = await res.json();
      data = data.sort((a: PortfolioItem, b: PortfolioItem) => {
        const yearA = parseInt(a.year, 10) || 0;
        const yearB = parseInt(b.year, 10) || 0;
        return yearB - yearA;
      });
      setItems(data);
    } else {
      alert('Failed to fetch items');
    }
    setLoading(false);
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    setItems((prev) => prev.filter((item) => item.id !== id));

    const res = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });

    if (!res.ok) {
      alert('Failed to delete item');
      fetchItems();
    }
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
            onCategoryChange={setNewCategory}
            onTitleChange={setNewTitle}
            onYearChange={setNewYear}
            onSubmit={handleAddSubmit}
          />
        </div>

        <h2 className="text-2xl font-bold mb-4">Portfolio Items</h2>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <AdminItemList
            items={items}
            editingId={editingId}
            onStartEditing={startEditing}
            onDelete={handleDelete}
            editCategory={editCategory}
            editTitle={editTitle}
            editYear={editYear}
            editDescription={editDescription}
            onEditCategoryChange={setEditCategory}
            onEditTitleChange={setEditTitle}
            onEditYearChange={setEditYear}
            onEditSubmit={handleEditSubmit}
            onCancelEdit={() => setEditingId(null)}
          />
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