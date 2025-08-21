"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faInstagram,
  faDiscord,
  faFacebook,
  faTwitter,
  faYoutube,
  faTiktok,
  faReddit
} from "@fortawesome/free-brands-svg-icons";
import SkillDisplay from "@/components/SkillDisplay";

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

interface ProfileData {
  name: string;
  bio: string;
  bioshort: string;
  avatar: string;
  socials: { platform: string; url: string }[];
  languages: {
    [language: string]: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
    };
  };
  programming: {
    [tech: string]: {
      level: number;
      skill: string;
    };
  };
}

const socialIcons: { [key: string]: any } = {
  github: faGithub,
  linkedin: faLinkedin,
  instagram: faInstagram,
  discord: faDiscord,
  facebook: faFacebook,
  twitter: faTwitter,
  youtube: faYoutube,
  tiktok: faTiktok,
  reddit: faReddit
};

export default function Home() {
  const [data, setData] = useState<Record<string, CategoryData>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [categoryScales, setCategoryScales] = useState<Record<string, number>>(
    {}
  );
  const [projectScales, setProjectScales] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [portfolioRes, profileRes] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/profile")
        ]);
        if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio");
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const portfolioData = await portfolioRes.json();
        const profileData = await profileRes.json();
        setData(portfolioData);
        setCategories(Object.keys(portfolioData));
        setProfile(profileData);
        const initialCatScales: Record<string, number> = {};
        Object.keys(portfolioData).forEach((cat) => {
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
        [cat]: hover ? 1.15 : 1
      }));
    }
  };

  const handleProjectHover = (id: string, hover: boolean) => {
    if (activeProject !== id) {
      setProjectScales((prev) => ({
        ...prev,
        [id]: hover ? 1.15 : 1
      }));
    }
  };

  const getSocialIcon = (platform: string) => {
    return socialIcons[platform.toLowerCase()] || faLink;
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {selectedItem.title} ({selectedItem.year || ""})
            </h2>
            <div
              className="text-lg text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: selectedItem.description
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
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            General Information on {activeCategory}
          </h2>
          <div
            className="text-lg text-gray-700 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: data[activeCategory].generalInfo
            }}
          />
        </motion.div>
      );
    }
    return (
      <motion.div
        key="overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col items-center text-center mx-auto"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          {profile?.name || "null null"}
        </h2>
        <img
          src={
            profile?.avatar ||
            "https://commons.wikimedia.org/wiki/File:No-Image-Placeholder.svg"
          }
          alt={profile?.name || "null"}
          className="w-64 h-auto rounded-4xl mb-4 shadow-lg object-cover"
        />
        <div className="text-center mb-8">
          <p className="text-black text-2xl font-semibold mb-2">
            {profile?.bioshort || "null"}
          </p>
          {profile?.bio && profile?.bio !== profile?.bioshort && (
            <button
              onClick={() => setShowFullBio((prev) => !prev)}
              className="text-blue-700 hover:underline mt-2 text-lg font-semibold"
            >
              {showFullBio ? "Show less." : "Read more."}
            </button>
          )}
          <AnimatePresence>
            {showFullBio && (
              <motion.div
                key="full-bio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "backInOut" }}
                className="mt-4 text-gray-700 text-base max-w-2xl mx-auto"
              >
                <p>{profile?.bio}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center space-x-4 mb-6 flex-wrap">
          {profile?.socials?.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-blue-600 flex text-xl items-center mx-2"
            >
              <FontAwesomeIcon
                icon={getSocialIcon(social.platform)}
                className="text-2xl mr-1"
              />{" "}
              {social.platform}
            </a>
          ))}
        </div>
        <SkillDisplay
          languages={profile?.languages || {}}
          programming={profile?.programming || {}}
        />
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col mt-30 mx-50 md:mx-2 md:mt-2 min-h-screen font-sans bg-gradient-to-b bg-white">
      <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full">
        <nav className="bg-white w-full md:w-80 p-6 md:border-r border-gray-200 overflow-y-auto md:sticky md:top-0 md:h-screen md:flex md:flex-col md:justify-center">
          <ul className="space-y-2">
            {loading ? (
              <li className="text-gray-500">Loading categories...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : categories.length === 0 ? (
              <li className="text-gray-500">No categories found.</li>
            ) : (
              categories.map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? "mb-4" : "mb-2"}
                >
                  <motion.button
                    onClick={() => toggleCategory(cat)}
                    onMouseEnter={() => handleCategoryHover(cat, true)}
                    onMouseLeave={() => handleCategoryHover(cat, false)}
                    animate={{ scale: categoryScales[cat] || 1 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
                  >
                    {cat}
                    <span className="text-gray-600">
                      {activeCategory === cat ? "-" : "+"}
                    </span>
                  </motion.button>
                  <AnimatePresence>
                    {activeCategory === cat && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0, scaleY: 0.9 }}
                        animate={{ opacity: 1, height: "auto", scaleY: 1 }}
                        exit={{ opacity: 0, height: 0, scaleY: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="pl-4 space-y-4 mt-2 origin-top"
                      >
                        {data[cat].projects.map((item) => (
                          <li key={item.id}>
                            <motion.button
                              onClick={() => selectProject(item.id)}
                              onMouseEnter={() =>
                                handleProjectHover(item.id, true)
                              }
                              onMouseLeave={() =>
                                handleProjectHover(item.id, false)
                              }
                              animate={{ scale: projectScales[item.id] || 1 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut"
                              }}
                              className="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
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
          <p className="mb-1">&copy; 2025 </p>
          <p>by Artur Burlakin</p>
        </div>
      </footer>
    </div>
  );
}