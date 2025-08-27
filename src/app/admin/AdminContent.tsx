"use client";

import { useState, useEffect, useRef } from "react";
import AdminForm from "../../components/AdminForm";
import AdminItemList from "../../components/AdminItemList";
import GeneralInfoEditor, {
  GeneralInfoEditorRef,
} from "../../components/GeneralInfoEditor";
import { motion, AnimatePresence } from "framer-motion";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  year: string;
  upfront?: boolean;
}

interface LanguageItem {
  lang: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
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
  const [loading, setLoading] = useState<boolean>(false);

  const [newCategory, setNewCategory] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newYear, setNewYear] = useState<string>("");
  const [newUpfront, setNewUpfront] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editYear, setEditYear] = useState<string>("");
  const [editUpfront, setEditUpfront] = useState<boolean>(false);

  const [profile, setProfile] = useState<{
    name: string;
    bioshort: string;
    bio: string;
    avatar: string;
    socials: { platform: string; url: string }[];
    languages: any;
    programming: any;
  } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBioshort, setProfileBioshort] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSocials, setProfileSocials] = useState<
    { platform: string; url: string }[]
  >([]);
  const [profileLanguages, setProfileLanguages] = useState<LanguageItem[]>([]);
  const [profileProgramming, setProfileProgramming] = useState<
    ProgrammingItem[]
  >([]);

  const bioEditorRef = useRef<GeneralInfoEditorRef>(null);

  const [currentTab, setCurrentTab] = useState<"profile" | "skills">("profile");

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
      setProfileBioshort(profileData.bioshort || "");
      setProfileBio(profileData.bio);
      setProfileAvatar(profileData.avatar);
      setProfileSocials(profileData.socials || []);

      const languagesArray = profileData.languages
        ? Object.entries(profileData.languages).map(
            ([lang, details]: [string, any]) => ({
              lang,
              reading: details.reading || 0,
              writing: details.writing || 0,
              speaking: details.speaking || 0,
              listening: details.listening || 0,
              skills: "",
            })
          )
        : [];
      setProfileLanguages(languagesArray);

      const programmingArray = profileData.programming
        ? Object.entries(profileData.programming).map(
            ([lang, details]: [string, any]) => ({
              lang,
              level: details.level,
              skills: details.skill,
            })
          )
        : [];
      setProfileProgramming(programmingArray);
    } catch (err) {
      console.error(err);
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

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const bioHTML = bioEditorRef.current?.getHTML() || profileBio;

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileName,
        bioshort: profileBioshort,
        bio: bioHTML,
        avatar: profileAvatar,
        socials: profileSocials,
        languages: profileLanguages,
        programming: profileProgramming,
      }),
    });
    if (res.ok) {
      setEditingProfile(false);
      fetchProfile();
      alert("Profile updated successfully!");
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
    setProfileLanguages([
      ...profileLanguages,
      {
        lang: "",
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0,
        skills: "",
      },
    ]);
  };
  const updateLanguage = (
    index: number,
    field:
      | "lang"
      | "reading"
      | "writing"
      | "speaking"
      | "listening"
      | "skills",
    value: string | number
  ) => {
    const updated = [...profileLanguages];
    if (
      field === "reading" ||
      field === "writing" ||
      field === "speaking" ||
      field === "listening"
    ) {
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
    setProfileProgramming([
      ...profileProgramming,
      { lang: "", level: 0, skills: "" },
    ]);
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
        upfront: newUpfront,
      }),
    });
    if (res.ok) {
      setNewCategory("");
      setNewTitle("");
      setNewYear("");
      setNewUpfront(false);
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
    setEditUpfront(item.upfront ?? false);
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
        upfront: editUpfront,
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

  const handleCategoryInfoSubmit = async (cat: string, newInfo: string) => {
    const res = await fetch("/api/portfolio?type=generalInfo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, generalInfo: newInfo }),
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
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded shadow-md max-w-5xl w-full">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setCurrentTab("profile")}
          className={`px-4 py-2 rounded ${
            currentTab === "profile"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setCurrentTab("skills")}
          className={`px-4 py-2 rounded ${
            currentTab === "skills"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Languages & Skills
        </button>
      </div>
      {currentTab === "profile" && (
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Settings - Profile</h2>
          {profile ? (
            editingProfile ? (
              <form onSubmit={handleProfileSubmit} className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Name"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Bio
                  </label>
                  <input
                    type="text"
                    value={profileBioshort}
                    onChange={(e) => setProfileBioshort(e.target.value)}
                    placeholder="Short Bio"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Bio
                  </label>
                  <GeneralInfoEditor
                    ref={bioEditorRef}
                    initialContent={profileBio}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="Avatar URL"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                    required
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Social Links</h3>
                  {profileSocials.map((social, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-end">
                      <input
                        type="text"
                        value={social.platform}
                        onChange={(e) =>
                          updateSocial(index, "platform", e.target.value)
                        }
                        placeholder="Platform"
                        className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                      />
                      <input
                        type="text"
                        value={social.url}
                        onChange={(e) =>
                          updateSocial(index, "url", e.target.value)
                        }
                        placeholder="https://..."
                        className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        className="px-2 py-2 bg-red-500 text-white rounded h-fit"
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
                <div className="flex gap-2 mt-4">
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
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Short Bio:</strong> {profile.bioshort}
                </p>
                <div>
                  <strong>Bio:</strong>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: profile.bio }}
                  />
                </div>
                <p>
                  <strong>Avatar:</strong> {profile.avatar}
                </p>
                <div>
                  <strong>Socials:</strong>
                  <ul className="list-disc list-inside">
                    {profileSocials.map((s, i) => (
                      <li key={i}>
                        {s.platform}: {s.url}
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
              </div>
            )
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      )}
      {currentTab === "skills" && (
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Languages & Programming Skills</h2>
          <div>
            <h3 className="font-semibold mb-2">Languages</h3>
            {profileLanguages.map((language, index) => (
              <div key={index} className="border p-3 rounded mb-3">
                <div className="flex gap-2 mb-2 items-end">
                  <input
                    type="text"
                    value={language.lang}
                    onChange={(e) => updateLanguage(index, "lang", e.target.value)}
                    placeholder="e.g., English"
                    className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded h-fit"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  <input
                    type="number"
                    value={language.reading}
                    onChange={(e) => updateLanguage(index, "reading", e.target.value)}
                    placeholder="Reading %"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                  <input
                    type="number"
                    value={language.writing}
                    onChange={(e) => updateLanguage(index, "writing", e.target.value)}
                    placeholder="Writing %"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                  <input
                    type="number"
                    value={language.speaking}
                    onChange={(e) => updateLanguage(index, "speaking", e.target.value)}
                    placeholder="Speaking %"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                  <input
                    type="number"
                    value={language.listening}
                    onChange={(e) => updateLanguage(index, "listening", e.target.value)}
                    placeholder="Listening %"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                </div>
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
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Programming Languages & Technologies</h3>
            {profileProgramming.map((programming, index) => (
              <div key={index} className="flex gap-2 mb-2 items-end">
                <input
                  type="text"
                  value={programming.lang}
                  onChange={(e) => updateProgramming(index, "lang", e.target.value)}
                  placeholder="e.g., TypeScript"
                  className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                />
                <input
                  type="number"
                  value={programming.level}
                  onChange={(e) => updateProgramming(index, "level", e.target.value)}
                  placeholder="Level %"
                  className="px-3 py-2 border border-gray-300 rounded-md w-24"
                />
                <input
                  type="text"
                  value={programming.skills}
                  onChange={(e) => updateProgramming(index, "skills", e.target.value)}
                  placeholder="Skills / Keywords"
                  className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeProgramming(index)}
                  className="px-2 py-2 bg-red-500 text-white rounded h-fit"
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
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleProfileSubmit()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Skills
            </button>
          </div>
        </div>
      )}
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Portfolio Item</h2>
        <AdminForm
          isEdit={false}
          category={newCategory}
          title={newTitle}
          year={newYear}
          description=""
          upfront={newUpfront}
          existingCategories={categories}
          onCategoryChange={setNewCategory}
          onTitleChange={setNewTitle}
          onYearChange={setNewYear}
          onUpfrontChange={setNewUpfront}
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
                      <h3 className="font-semibold mb-2">General Information</h3>
                      {editingCategoryInfo === cat ? (
                        <GeneralInfoEditor
                          initialContent={data[cat].generalInfo}
                          onSave={(html) => handleCategoryInfoSubmit(cat, html)}
                          onCancel={() => setEditingCategoryInfo(null)}
                        />
                      ) : (
                        <>
                          <div
                            className="text-gray-700 mb-2 prose max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                data[cat].generalInfo ||
                                "<p>No general info set.</p>",
                            }}
                          />
                          <button
                            onClick={() => setEditingCategoryInfo(cat)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit General Info
                          </button>
                        </>
                      )}
                    </div>
                    <AdminItemList
                      items={data[cat].projects.map((item) => ({
                        ...item,
                        category: cat,
                      }))}
                      editingId={editingId}
                      existingCategories={categories}
                      editCategory={editCategory}
                      editTitle={editTitle}
                      editYear={editYear}
                      editDescription={editDescription}
                      editUpfront={editUpfront}
                      onStartEditing={(item) => startEditing(item, cat)}
                      onDelete={(id) => handleDelete(id, cat)}
                      onEditCategoryChange={setEditCategory}
                      onEditTitleChange={setEditTitle}
                      onEditYearChange={setEditYear}
                      onEditUpfrontChange={setEditUpfront}
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