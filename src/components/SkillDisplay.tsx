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
  languages?: LanguagesData;
  programming?: ProgrammingData;
  showProgramming?: boolean;
  showLanguages?: boolean;
}

export default function SkillDisplay({
  languages = {},
  programming = {},
  showProgramming = true,
  showLanguages = true,
}: SkillDisplayProps) {
  const [showAllProgramming, setShowAllProgramming] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const circleSize = 150;
  const radius = 60;
  const center = circleSize / 2;

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderCircle = (value: number) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <>
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
          className="transition-all duration-700 ease-in-out print:hidden"
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
          className="hidden print:block"
        />
      </>
    );
  };

  return (
    <div className="w-auto flex flex-col gap-6 relative print:gap-2">
      {showProgramming && (
        <div className="p-2 print:p-0">
          {Object.keys(programming).length > 6 && (
            <div className="text-center print:hidden">
              <button
                onClick={() => setShowAllProgramming(!showAllProgramming)}
                className="items-center font-semibold justify-between px-4 py-2 rounded-full transition-colors border border-gray-200 bg-white text-gray-700"
              >
                {showAllProgramming ? "Show Less -" : "Show More +"}
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 
                print:grid print:grid-cols-6 print:gap-2">
              <AnimatePresence>
                {Object.entries(programming)
                  .slice(0, showAllProgramming ? undefined : 8)
                  .map(([tech, { level, skill }], index) => (
                    <motion.div
                      key={tech}
                      className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center 
                                print:w-[120px] print:h-[120px]"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <svg
                        viewBox={`0 0 ${circleSize} ${circleSize}`}
                        className="w-full h-full"
                      >
                        {renderCircle(level)}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <h4 className="text-sm font-semibold text-gray-800 
                                      print:text-xs print:font-bold print:text-black print:mt-10">
                          {tech}
                        </h4>
                        <span className="mt-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium text-xs 
                                        print:bg-transparent print:text-black print:px-0 print:py-0">
                          {skill}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
        </div>
      )}

      {showLanguages && (
        <div className="p-2 print:p-0">
          <div className="grid md:grid-cols-4 gap-6 print:grid print:grid-cols-3 print:gap-2">
            <AnimatePresence>
              {Object.entries(languages)
                .slice(0, showAllLanguages ? undefined : 4)
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

                  return (
                    <motion.div
                      key={lang}
                      className="relative w-[150px] h-[150px] mx-auto flex items-center justify-center 
                                 print:w-[100px] print:h-[100px]"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <svg
                        viewBox={`0 0 ${circleSize} ${circleSize}`}
                        className="w-full h-full"
                      >
                        {renderCircle(avg)}
                      </svg>
                      <div className="absolute text-center">
                        <h4 className="text-lg font-semibold text-gray-800 
                                       print:text-xs print:font-bold print:text-black">
                          {lang}
                        </h4>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold text-sm 
                                         print:bg-transparent print:text-black print:px-0 print:py-0 print:text-xs">
                          {skillString}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
          {Object.keys(languages).length > 4 && (
            <div className="text-center mt-4 print:hidden">
              <button
                onClick={() => setShowAllLanguages(!showAllLanguages)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showAllLanguages ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}