"use client";

import { useState, useEffect, useRef } from "react";
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
  faReddit,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { Element, scroller } from "react-scroll";
import SkillDisplay from "@/components/SkillDisplay";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  year: string;
  upfront?: boolean;
  queuenumber?: number;
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
  socials: { platform: string; url: string; }[];
  phone: string;
  email: string;
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
  reddit: faReddit,
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

  const bioRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    scroller.scrollTo("topOfPage", {
      duration: 500,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  useEffect(() => {
    if (showFullBio && bioRef.current) {
      bioRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (!showFullBio) {
      scrollToTop();
    }
  }, [showFullBio]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [portfolioRes, profileRes] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/profile"),
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
    scrollToTop();
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
    scrollToTop();
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

  const getSocialIcon = (platform: string) => {
    return socialIcons[platform.toLowerCase()] || faLink;
  };

  const allUpfrontProjects = categories
    .flatMap((cat) => data[cat]?.projects.filter((p) => p.upfront));
  
  const upfrontProjects = Array.from(new Map(allUpfrontProjects.map(item => [item.id, item])).values())
    .sort((a, b) => {
      const queueA = a.queuenumber ?? 0;
      const queueB = b.queuenumber ?? 0;

      if (queueA > 0 && queueB === 0) return -1;
      if (queueA === 0 && queueB > 0) return 1;

      if (queueA > 0 && queueB > 0) {
        if (queueA !== queueB) {
          return queueA - queueB;
        }
      }

      const yearA = parseInt(a.year.split('-')[0], 10);
      const yearB = parseInt(b.year.split('-')[0], 10);
      return yearB - yearA;
    });

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
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              {selectedItem.title} ({selectedItem.year || ""})
            </h2>
            <div
              className="text-base md:text-lg text-gray-700 prose max-w-none"
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
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
            General Information on {activeCategory}
          </h2>
          <div
            className="text-base md:text-lg text-gray-700 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: data[activeCategory].generalInfo,
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
        className="flex flex-col items-left md:items-left mr-0 md:mr-75 print:w-full print:m-0"
      >
        <motion.button
          onClick={() => window.print()}
          onMouseEnter={() => handleCategoryHover("",true)}
          onMouseLeave={() => handleCategoryHover("", false)}
          animate={{ scale: categoryScales[""] || 1 }}
          className="text-white w-64 print:hidden bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Print Portfolio
        </motion.button>
        <h2 className="text-3xl sm:text-4xl text-center font-bold mb-2 text-gray-800">
          {profile?.name || "null null"}
        </h2>
        <div className="text-left grid grid-cols-1 lg:grid-cols-3 w-full">
            <div className="lg:text-left text-center order-2 lg:order-1 lg:mt-2 mt-0 lg:col-span-2 lg:p-7 p-4 print:p-2 print:ml-2 print:order-0 print:text-left">
                <p className="text-black text-xl sm:text-2xl font-semibold mb-2">
                    {profile?.bioshort || "null"}
                </p>
                <div
                className="text-base md:text-lg text-gray-700 prose max-w-none prose-strong:font-bold prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{
                    __html: profile?.bio || "null",
                }}
                />
            </div>
            <div className="order-1 lg:order-2 flex mt-0 lg:mt-4 justify-center items-center p-4 print:col-3 print:order-0">
                <img
                src={profile?.avatar || "https://commons.wikimedia.org/wiki/File:No-Image-Placeholder.svg"}
                alt={profile?.name || "Avatar"}
                className="w-48 h-48 md:w-64 md:h-64 object-top items-end mb-4 md:mb-0 rounded-full shadow-lg object-cover"
                />
            </div>
        </div>
        <div className="print:hidden w-full">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-6 print:hidden">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  {profile.email}
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  {profile.phone}
                </a>
              )}
              {profile?.socials?.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon
                    icon={getSocialIcon(social.platform)}
                    className="mr-2"
                  />
                  {social.platform}
                </a>
              ))}
          </div>
        </div>
        <div className="hidden print:grid grid-cols-2 w-full border-t border-gray-300 my-4">
              <div className="col-start-1 m-5">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  {profile.email}
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  {profile.phone}
                </a>
              )}
              </div>
              <div className="col-start-2 m-5">
                {profile?.socials?.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-800 hover:text-blue-600 text-base md:text-lg print:hidden"
                >
                  <FontAwesomeIcon
                    icon={getSocialIcon(social.platform)}
                    className="mr-2"
                  />
                  {social.url.replace('https://', '')}
                </a>
              ))}
              </div>
        </div>
        <SkillDisplay
          programming={profile?.programming || {}}
          showProgramming={true}
          showLanguages={false}
        />
        <div className="mt-2 text-left">
          <div className="grid gap-6">
            {upfrontProjects.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  {p.title}{" "}
                  <span className="text-gray-500">({p.year})</span>
                </h3>
                <div
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: p.description }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };
  return (
    <div className="bg-white print:w-full print:m-0">
      <Element name="topOfPage" />
      <div className="flex flex-1 flex-col md:flex-row w-full mx-auto items-start print:mx-0 print:block">
        <nav className=" md:w-80 w-full row-span-3 flex-shrink-0 p-4 md:p-6 md:border-r border-gray-200 md:sticky md:top-0 md:h-screen md:flex md:flex-col md:justify-center print:hidden">
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
                    className="w-full flex items-center font-semibold justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
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
                        {Array.from(new Map(data[cat].projects.map(item => [item.id, item])).values())
                          .sort((a, b) => {
                            const yearA = parseInt(a.year.split('-')[0], 10);
                            const yearB = parseInt(b.year.split('-')[0], 10);
                            return yearB - yearA;
                          })
                          .map((item) => (
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
                                ease: "easeInOut",
                              }}
                              className="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700 text-sm"
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
      <footer className="bg-white py-6 w-full text-center text-gray-600 text-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} by Artur Burlakin</p>
        </div>
      </footer>
    </div>
  );
}