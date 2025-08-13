"use client";

import { useState } from "react";

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

const skillColors: Record<string, string> = {
  reading: "#3b82f6",
  writing: "#10b981",
  speaking: "#ef4444",
  listening: "#8b5cf6"
};

export default function SkillDisplay({ languages, programming }: SkillDisplayProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.target as SVGPathElement | SVGCircleElement).getBoundingClientRect();
    setTooltip({
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(" ");
  };

  return (
    <div className="w-full flex flex-col gap-8 relative">
      {tooltip && (
        <div
          className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)"
          }}
        >
          {tooltip.text}
        </div>
      )}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          🌍 Languages
        </h3>
        <div className="grid gap-8 md:grid-cols-4">
          {Object.entries(languages).map(([lang, skills], index) => {
            const skillEntries = Object.entries(skills);
            const avg =
              skillEntries.reduce((sum, [, val]) => sum + val, 0) /
              skillEntries.length;
            const segmentAngle = 360 / skillEntries.length;
            const radius = 50;
            const center = 62.5;

            return (
              <div
                key={index}
                className="relative w-[125px] h-[125px] mx-auto flex items-center justify-center"
              >
                <svg width="125" height="125">
                  {skillEntries.map(([skillName, value], i) => {
                    const startAngle = i * segmentAngle;
                    const endAngle = startAngle + segmentAngle - 5;
                    const filledEndAngle =
                      startAngle + (segmentAngle - 5) * (value / 100);

                    return (
                      <g key={skillName}>
                        <path
                          d={describeArc(center, center, radius, startAngle, endAngle)}
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d={describeArc(center, center, radius, startAngle, filledEndAngle)}
                          stroke={skillColors[skillName.toLowerCase()] || "#3b82f6"}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          onMouseEnter={(e) =>
                            showTooltip(`${skillName}: ${value}%`, e)
                          }
                          onMouseLeave={hideTooltip}
                          style={{ cursor: "pointer" }}
                        />
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute text-center">
                  <h4 className="text-sm font-semibold text-gray-800">{lang}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {Math.round(avg)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          💻 Programming Languages & Technologies
        </h3>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(programming).map(([tech, { level, skill }], index) => {
            const radius = 50;
            const center = 62.5;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (level / 100) * circumference;

            return (
              <div
                key={index}
                className="relative w-[125px] h-[125px] mx-auto flex items-center justify-center"
              >
                <svg width="125" height="125">
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
                    stroke="#10b981"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                    onMouseEnter={(e) =>
                      showTooltip(`${tech} - ${skill}: ${level}%`, e)
                    }
                    onMouseLeave={hideTooltip}
                  />
                </svg>
                <div className="absolute text-center">
                  <h4 className="text-sm font-semibold text-gray-800">{tech}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {skill}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}