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
  queuenumber?: number;
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
  const [newQueuenumber, setNewQueuenumber] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editYear, setEditYear] = useState<string>("");
  const [editUpfront, setEditUpfront] = useState<boolean>(false);
  const [editQueuenumber, setEditQueuenumber] = useState<number>(0);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [profile, setProfile] = useState<{
    email: string;
    phone: string;
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

  const [currentTab, setCurrentTab] = useState<"portfolio" | "profile" | "skills">("portfolio");

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
      setProfileEmail(profileData.email || "");
      setProfilePhone(profileData.phone || "");
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
        email: profileEmail,
        phone: profilePhone,
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
        queuenumber: newQueuenumber,
      }),
    });
    if (res.ok) {
      setNewCategory("");
      setNewTitle("");
      setNewYear("");
      setNewUpfront(false);
      setNewQueuenumber(0);
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
    setEditQueuenumber(item.queuenumber ?? 0);
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
        queuenumber: editQueuenumber,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setExpandedProject(null);
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
    setExpandedProject(null);
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) newSet.delete(cat);
      else newSet.add(cat);
      return newSet;
    });
  };
  
  const toggleProject = (id: string) => {
    if (editingId === id) return;
    setExpandedProject(prev => (prev === id ? null : id));
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setExpandedProject(null);
  };

  const startEditingProfile = () => {
    setEditingProfile(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setCurrentTab("portfolio")}
            className={`px-4 py-2 -mb-px font-semibold ${
              currentTab === "portfolio"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setCurrentTab("profile")}
            className={`px-4 py-2 -mb-px font-semibold ${
              currentTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setCurrentTab("skills")}
            className={`px-4 py-2 -mb-px font-semibold ${
              currentTab === "skills"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Languages & Skills
          </button>
        </div>

        {currentTab === "profile" && (
           <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full mb-8 bg-white p-6 rounded-lg shadow-md"
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Settings - Profile</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="px-3 py-2 border border-gray-300 rounded-md w-full"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+46 70 123 45 67"
                        className="px-3 py-2 border border-gray-300 rounded-md w-full"
                    />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-gray-700">Social Links</h3>
                        {profileSocials.map((social, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
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
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                            Remove
                            </button>
                        </div>
                        ))}
                        <button
                        type="button"
                        onClick={addSocial}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md mt-2 hover:bg-green-600"
                        >
                        Add Social
                        </button>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                        >
                        Save Profile
                        </button>
                        <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
                        >
                        Cancel
                        </button>
                    </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Short Bio:</strong> {profile.bioshort}</p>
                        <div>
                            <strong>Bio:</strong>
                            <div
                                className="prose max-w-none p-2 border rounded-md mt-1"
                                dangerouslySetInnerHTML={{ __html: profile.bio }}
                            />
                        </div>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.phone}</p>
                        <p><strong>Avatar:</strong> <a href={profile.avatar} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{profile.avatar}</a></p>
                        <div>
                            <strong>Socials:</strong>
                            <ul className="list-disc list-inside ml-4">
                                {profileSocials.map((s, i) => (
                                <li key={i}>{s.platform}: <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{s.url}</a></li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={startEditingProfile}
                            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 mt-4"
                        >
                            Edit Profile
                        </button>
                    </div>
                )
                ) : (
                <p>Loading profile...</p>
                )}
            </motion.div>
          </AnimatePresence>
        )}

        {currentTab === "skills" && (
           <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full mb-8 bg-white p-6 rounded-lg shadow-md"
            >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Languages & Programming Skills</h2>
            <div>
                <h3 className="font-semibold mb-2 text-gray-700">Languages</h3>
                {profileLanguages.map((language, index) => (
                <div key={index} className="border p-4 rounded-md mb-3 bg-gray-50">
                    <div className="flex gap-2 mb-3 items-center">
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
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Remove
                    </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md mt-2 hover:bg-green-600"
                >
                Add Language
                </button>
            </div>
            <div className="mt-6">
                <h3 className="font-semibold mb-2 text-gray-700">Programming Languages & Technologies</h3>
                {profileProgramming.map((programming, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                    <input
                    type="text"
                    value={programming.lang}
                    onChange={(e) => updateProgramming(index, "lang", e.target.value)}
                    placeholder="e.g., TypeScript"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto flex-1"
                    />
                    <input
                    type="number"
                    value={programming.level}
                    onChange={(e) => updateProgramming(index, "level", e.target.value)}
                    placeholder="Level %"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-28"
                    />
                    <input
                    type="text"
                    value={programming.skills}
                    onChange={(e) => updateProgramming(index, "skills", e.target.value)}
                    placeholder="Skills / Keywords"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto flex-1"
                    />
                    <button
                    type="button"
                    onClick={() => removeProgramming(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
                    >
                    Remove
                    </button>
                </div>
                ))}
                <button
                type="button"
                onClick={addProgramming}
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md mt-2 hover:bg-green-600"
                >
                Add Technology
                </button>
            </div>
            <div className="flex gap-2 mt-6">
                <button
                type="button"
                onClick={() => handleProfileSubmit()}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                Save Skills
                </button>
            </div>
          </motion.div>
          </AnimatePresence>
        )}

        {currentTab === "portfolio" && (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="w-full mb-8 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Portfolio Item</h2>
                        <AdminForm
                        isEdit={false}
                        category={newCategory}
                        title={newTitle}
                        year={newYear}
                        description=""
                        upfront={newUpfront}
                        queuenumber={newQueuenumber}
                        existingCategories={categories}
                        onCategoryChange={setNewCategory}
                        onTitleChange={setNewTitle}
                        onYearChange={setNewYear}
                        onUpfrontChange={setNewUpfront}
                        onQueuenumberChange={setNewQueuenumber}
                        onSubmit={handleAddSubmit}
                        />
                    </div>
                    <div className="w-full bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Portfolio Items by Category</h2>
                        {loading ? (
                        <p>Loading...</p>
                        ) : categories.length === 0 ? (
                        <p>No items found.</p>
                        ) : (
                        <ul className="w-full space-y-4">
                            {categories.map((cat) => (
                            <li key={cat} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex justify-between items-center bg-gray-100 p-4">
                                <button
                                    onClick={() => toggleCategory(cat)}
                                    className="flex-1 text-left text-lg font-semibold text-gray-700 hover:text-blue-600 flex justify-between items-center"
                                >
                                    {cat}
                                    <span className="transform transition-transform duration-300" style={{ transform: expandedCategories.has(cat) ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="ml-4 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600"
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
                                    className="p-4 space-y-4"
                                    >
                                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                        <h3 className="font-semibold mb-2 text-gray-700">General Information</h3>
                                        {editingCategoryInfo === cat ? (
                                        <GeneralInfoEditor
                                            initialContent={data[cat].generalInfo}
                                            onSave={(html) => handleCategoryInfoSubmit(cat, html)}
                                            onCancel={() => setEditingCategoryInfo(null)}
                                        />
                                        ) : (
                                        <>
                                            <div
                                            className="prose max-w-none mb-2"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                data[cat].generalInfo ||
                                                "<p>No general info set.</p>",
                                            }}
                                            />
                                            <button
                                            onClick={() => setEditingCategoryInfo(cat)}
                                            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
                                            >
                                            Edit General Info
                                            </button>
                                        </>
                                        )}
                                    </div>
                                    <AdminItemList
                                        items={data[cat].projects.map((item) => ({...item, category: cat}))}
                                        editingId={editingId}
                                        expandedProject={expandedProject}
                                        existingCategories={categories}
                                        editCategory={editCategory}
                                        editTitle={editTitle}
                                        editYear={editYear}
                                        editDescription={editDescription}
                                        editUpfront={editUpfront}
                                        editQueuenumber={editQueuenumber}
                                        onStartEditing={(item) => startEditing(item, cat)}
                                        onDelete={(id) => handleDelete(id, cat)}
                                        onToggleProject={toggleProject}
                                        onEditCategoryChange={setEditCategory}
                                        onEditTitleChange={setEditTitle}
                                        onEditYearChange={setEditYear}
                                        onEditUpfrontChange={setEditUpfront}
                                        onEditQueuenumberChange={setEditQueuenumber}
                                        onEditSubmit={handleEditSubmit}
                                        onCancelEdit={handleCancelEdit}
                                    />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        )}
      </div>
    </div>
  );
}