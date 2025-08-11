"use client";

import { useState, useEffect } from "react";
import AdminForm from "../../components/AdminForm";
import AdminItemList from "../../components/AdminItemList";
import { motion, AnimatePresence } from "framer-motion";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  year: string;
}

interface LanguageItem {
  lang: string;
  level: number;
  skills: string;
}

interface ProgrammingItem {
  lang: string;
  level: number;
  skills: string;
}

export default function AdminContent() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [data, setData] = useState<
    Record<string, { generalInfo: string; projects: PortfolioItem[] }>
  >({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [editingCategoryInfo, setEditingCategoryInfo] = useState<string | null>(
    null
  );
  const [editGeneralInfo, setEditGeneralInfo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [newCategory, setNewCategory] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newYear, setNewYear] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editYear, setEditYear] = useState<string>("");

  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
    avatar: string;
    socials: { platform: string; url: string }[];
    languages: LanguageItem[];
    programming: ProgrammingItem[];
  } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSocials, setProfileSocials] = useState<
    { platform: string; url: string }[]
  >([]);
  const [profileLanguages, setProfileLanguages] = useState<LanguageItem[]>([]);
  const [profileProgramming, setProfileProgramming] = useState<ProgrammingItem[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      fetchProfile();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch data");
      const fetchedData = await res.json();
      setData(fetchedData);
      setCategories(Object.keys(fetchedData));
    } catch (err) {
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const profileData = await res.json();
      setProfile(profileData);
      setProfileName(profileData.name);
      setProfileBio(profileData.bio);
      setProfileAvatar(profileData.avatar);
      setProfileSocials(profileData.socials || []);
      setProfileLanguages(profileData.languages || []);
      setProfileProgramming(profileData.programming || []);
    } catch (err) {
      alert("Failed to fetch profile");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setIsLoggedIn(true);
      setUsername("");
      setPassword("");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent, description: string) => {
    e.preventDefault();
    if (!newCategory) {
      alert("Please select or enter a category");
      return;
    }
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        title: newTitle,
        description,
        year: newYear,
      }),
    });
    if (res.ok) {
      setNewCategory("");
      setNewTitle("");
      setNewYear("");
      fetchData();
    } else {
      alert("Failed to add item");
    }
  };

  const startEditing = (item: PortfolioItem, category: string) => {
    setEditingId(item.id);
    setEditCategory(category);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditYear(item.year || "");
  };

  const handleEditSubmit = async (
    e: React.FormEvent,
    id: string,
    description: string
  ) => {
    e.preventDefault();
    const res = await fetch(`/api/portfolio?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: editCategory,
        title: editTitle,
        description,
        year: editYear,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchData();
    } else {
      alert("Failed to edit item");
    }
  };

  const handleDelete = async (id: string, category: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(`/api/portfolio?id=${id}&category=${category}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Failed to delete project");
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category and all its projects?"
      )
    )
      return;
    const res = await fetch(`/api/portfolio?category=${cat}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Failed to delete category");
    }
  };

  const handleCategoryInfoSubmit = async (cat: string) => {
    const res = await fetch("/api/portfolio?type=generalInfo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, generalInfo: editGeneralInfo }),
    });
    if (res.ok) {
      setEditingCategoryInfo(null);
      fetchData();
    } else {
      alert("Failed to update general info");
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) newSet.delete(cat);
      else newSet.add(cat);
      return newSet;
    });
  };

  const startEditingProfile = () => {
    setEditingProfile(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileName,
        bio: profileBio,
        avatar: profileAvatar,
        socials: profileSocials,
        languages: profileLanguages,
        programming: profileProgramming,
      }),
    });
    if (res.ok) {
      setEditingProfile(false);
      fetchProfile();
    } else {
      alert("Failed to update profile");
    }
  };

  const addSocial = () => {
    setProfileSocials([...profileSocials, { platform: "", url: "" }]);
  };

  const updateSocial = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    const updated = [...profileSocials];
    updated[index][field] = value;
    setProfileSocials(updated);
  };

  const removeSocial = (index: number) => {
    setProfileSocials(profileSocials.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    setProfileLanguages([...profileLanguages, { lang: "", level: 0, skills: "" }]);
  };

  const updateLanguage = (
    index: number,
    field: "lang" | "level" | "skills",
    value: string | number
  ) => {
    const updated = [...profileLanguages];
    if (field === "level") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as string;
    }
    setProfileLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setProfileLanguages(profileLanguages.filter((_, i) => i !== index));
  };

  const addProgramming = () => {
    setProfileProgramming([...profileProgramming, { lang: "", level: 0, skills: "" }]);
  };

  const updateProgramming = (
    index: number,
    field: "lang" | "level" | "skills",
    value: string | number
  ) => {
    const updated = [...profileProgramming];
    if (field === "level") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as string;
    }
    setProfileProgramming(updated);
  };

  const removeProgramming = (index: number) => {
    setProfileProgramming(profileProgramming.filter((_, i) => i !== index));
  };

  const startEditingCategoryInfo = (cat: string) => {
    setEditingCategoryInfo(cat);
    setEditGeneralInfo(data[cat].generalInfo);
  };

  if (!isLoggedIn) {
    return (
      <form
        onSubmit={handleLoginSubmit}
        className="w-full max-w-md p-8 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
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
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded shadow-md max-w-4xl w-full">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4">Settings - Profile</h2>
        {profile ? (
          editingProfile ? (
            <form onSubmit={handleProfileSubmit} className="grid gap-4">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Name"
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Bio"
                className="px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                required
              />
              <input
                type="text"
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                placeholder="Avatar URL"
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <div>
                <h3 className="font-semibold mb-2">Social Links</h3>
                {profileSocials.map((social, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={social.platform}
                      onChange={(e) =>
                        updateSocial(index, "platform", e.target.value)
                      }
                      placeholder="Platform (e.g., LinkedIn)"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) =>
                        updateSocial(index, "url", e.target.value)
                      }
                      placeholder="URL"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSocial}
                  className="px-4 py-2 bg-green-500 text-white rounded mt-2"
                >
                  Add Social
                </button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                {profileLanguages.map((language, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={language.lang}
                      onChange={(e) =>
                        updateLanguage(index, "lang", e.target.value)
                      }
                      placeholder="Language"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <input
                      type="number"
                      value={language.level}
                      onChange={(e) =>
                        updateLanguage(index, "level", e.target.value)
                      }
                      placeholder="Level (0-100)"
                      className="px-3 py-2 border border-gray-300 rounded-md w-24"
                    />
                    <input
                      type="text"
                      value={language.skills}
                      onChange={(e) =>
                        updateLanguage(index, "skills", e.target.value)
                      }
                      placeholder="Skills"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 bg-green-500 text-white rounded mt-2"
                >
                  Add Language
                </button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Programming Languages & Technologies</h3>
                {profileProgramming.map((programming, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={programming.lang}
                      onChange={(e) =>
                        updateProgramming(index, "lang", e.target.value)
                      }
                      placeholder="Language/Tech"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <input
                      type="number"
                      value={programming.level}
                      onChange={(e) =>
                        updateProgramming(index, "level", e.target.value)
                      }
                      placeholder="Level (0-100)"
                      className="px-3 py-2 border border-gray-300 rounded-md w-24"
                    />
                    <input
                      type="text"
                      value={programming.skills}
                      onChange={(e) =>
                        updateProgramming(index, "skills", e.target.value)
                      }
                      placeholder="Skills"
                      className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeProgramming(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProgramming}
                  className="px-4 py-2 bg-green-500 text-white rounded mt-2"
                >
                  Add Programming
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Bio:</strong> {profile.bio}
              </p>
              <p>
                <strong>Avatar:</strong> {profile.avatar}
              </p>
              <div>
                <strong>Socials:</strong>
                <ul>
                  {profile.socials.map((s, i) => (
                    <li key={i}>
                      {s.platform}: {s.url}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Languages:</strong>
                <ul>
                  {profile.languages.map((l, i) => (
                    <li key={i}>
                      {l.lang}: {l.skills} (Level: {l.level}%)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Programming:</strong>
                <ul>
                  {profile.programming.map((p, i) => (
                    <li key={i}>
                      {p.lang}: {p.skills} (Level: {p.level}%)
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={startEditingProfile}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mt-4"
              >
                Edit Profile
              </button>
            </>
          )
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Portfolio Item</h2>
        <AdminForm
          isEdit={false}
          category={newCategory}
          title={newTitle}
          year={newYear}
          description=""
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
                  <span>{expandedCategories.has(cat) ? "-" : "+"}</span>
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pl-4 space-y-4 mt-2"
                  >
                    <div className="p-4 border border-gray-300 rounded-md">
                      <h3 className="font-semibold mb-2">
                        General Information
                      </h3>
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
                          <p className="text-gray-700 mb-2">
                            {data[cat].generalInfo || "No general info set."}
                          </p>
                          <button
                            onClick={() => startEditingCategoryInfo(cat)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit General Info
                          </button>
                        </>
                      )}
                    </div>
                    <AdminItemList
                      items={data[cat].projects.map(item => ({ ...item, category: cat }))}
                      editingId={editingId}
                      existingCategories={categories}
                      editCategory={editCategory}
                      editTitle={editTitle}
                      editYear={editYear}
                      editDescription={editDescription}
                      onStartEditing={(item) => startEditing(item, cat)}
                      onDelete={(id) => handleDelete(id, cat)}
                      onEditCategoryChange={setEditCategory}
                      onEditTitleChange={setEditTitle}
                      onEditYearChange={setEditYear}
                      onEditSubmit={handleEditSubmit}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  </motion.div>
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
        Logout
      </button>
    </div>
  );
}