"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LanguagesData {
  [language: string]: {
    [skillName: string]: number;
  };
}

interface ProgrammingData {
  [tech: string]: {
    level: number;
    skill: string;
  };
}

interface SkillDisplayProps {
  languages: LanguagesData;
  programming: ProgrammingData;
}

export default function SkillDisplay({
  languages,
  programming
}: SkillDisplayProps) {
  const [showAllProgramming, setShowAllProgramming] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const circleSize = 150;
  const radius = 60;
  const center = circleSize / 2;

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="w-full flex flex-col gap-8 relative">
      <div className="p-2">
        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(programming)
            .slice(0, 4)
            .map(([tech, { level, skill }], index) => {
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (level / 100) * circumference;

              return (
                <motion.div
                  key={tech}
                  className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <svg width={circleSize} height={circleSize}>
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="#6b7280"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{
                        transition: "stroke-dashoffset 0.8s ease-in-out"
                      }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {tech}
                    </h4>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold text-sm">
                      {skill}
                    </span>
                  </div>
                </motion.div>
              );
            })}
        </div>

        <AnimatePresence>
          {showAllProgramming && (
            <motion.div
              className="grid md:grid-cols-4 gap-6 mt-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {Object.entries(programming)
                .slice(4)
                .map(([tech, { level, skill }], index) => {
                  const circumference = 2 * Math.PI * radius;
                  const offset =
                    circumference - (level / 100) * circumference;

                  return (
                    <motion.div
                      key={tech}
                      className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <svg width={circleSize} height={circleSize}>
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke="#6b7280"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          style={{
                            transition: "stroke-dashoffset 0.8s ease-in-out"
                          }}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {tech}
                        </h4>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold text-sm">
                          {skill}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(programming).length > 4 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAllProgramming(!showAllProgramming)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAllProgramming ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          🌍 Languages
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(languages)
            .slice(0, 4)
            .map(([lang, skills], index) => {
              const skillEntries = Object.entries(skills);
              const avg =
                skillEntries.reduce((sum, [, val]) => sum + val, 0) /
                skillEntries.length;

              const skillString = (() => {
                if (avg === 100) return "Native";
                if (avg >= 80) return "Fluent";
                if (avg >= 60) return "Advanced";
                if (avg >= 40) return "Intermediate";
                if (avg >= 20) return "Elementary";
                return "Beginner";
              })();

              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (avg / 100) * circumference;

              return (
                <motion.div
                  key={lang}
                  className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <svg width={circleSize} height={circleSize}>
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="#6b7280"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${center} ${center})`}
                      style={{
                        transition: "stroke-dashoffset 0.8s ease-in-out"
                      }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {lang}
                    </h4>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold text-sm">
                      {skillString}
                    </span>
                  </div>
                </motion.div>
              );
            })}
        </div>

        <AnimatePresence>
          {showAllLanguages && (
            <motion.div
              className="grid md:grid-cols-4 gap-6 mt-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {Object.entries(languages)
                .slice(4)
                .map(([lang, skills], index) => {
                  const skillEntries = Object.entries(skills);
                  const avg =
                    skillEntries.reduce((sum, [, val]) => sum + val, 0) /
                    skillEntries.length;

                  const skillString = (() => {
                    if (avg === 100) return "Native";
                    if (avg >= 80) return "Fluent";
                    if (avg >= 60) return "Advanced";
                    if (avg >= 40) return "Intermediate";
                    if (avg >= 20) return "Elementary";
                    return "Beginner";
                  })();

                  const circumference = 2 * Math.PI * radius;
                  const offset =
                    circumference - (avg / 100) * circumference;

                  return (
                    <motion.div
                      key={lang}
                      className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <svg width={circleSize} height={circleSize}>
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke="#6b7280"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          transform={`rotate(-90 ${center} ${center})`}
                          style={{
                            transition: "stroke-dashoffset 0.8s ease-in-out"
                          }}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {lang}
                        </h4>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold text-sm">
                          {skillString}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(languages).length > 4 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAllLanguages ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}