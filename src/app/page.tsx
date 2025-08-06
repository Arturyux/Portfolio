'use client';

import { JSX, useState } from 'react';
import Link  from 'next/link';

type SectionKey = 'home' | 'about' | 'projects' | 'contact';

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>('home');

  const sections: Record<SectionKey, JSX.Element> = {
    home: (
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Welcome to My Portfolio</h2>
      </div>
    ),
    about: (
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
      </div>
    ),
    projects: (
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Projects</h2>
        <ul className="list-disc list-inside text-lg text-gray-700">
        </ul>
      </div>
    ),
    contact: (
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
      </div>
    ),
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header className="bg-gray-800 text-white py-6 text-center">
        <h1 className="text-4xl font-bold tracking-[-0.01em]">
          Artur Burlakin Portfolio
        </h1>
      </header>
      <div className="flex flex-1 flex-col sm:flex-row">
        <nav className="bg-gray-100 w-full sm:w-64 p-6 border-r border-gray-200">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveSection('home')}
                className={`w-full px-4 py-2 text-left rounded ${
                  activeSection === 'home'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('about')}
                className={`w-full px-4 py-2 text-left rounded ${
                  activeSection === 'about'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('projects')}
                className={`w-full px-4 py-2 text-left rounded ${
                  activeSection === 'projects'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                Projects
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('contact')}
                className={`w-full px-4 py-2 text-left rounded ${
                  activeSection === 'contact'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                Contact
              </button>
            </li>
            <li>
              <Link href="/admin">
                <button className="w-full px-4 py-2 text-left rounded bg-gray-500 text-white hover:bg-gray-600">
                  Admin
                </button>
              </Link>
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-6">
          {sections[activeSection] || sections.home}
        </main>
      </div>
      <footer className="bg-gray-50 border-t border-gray-200 py-6 w-full">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p className="mb-1">&copy; 2025 Burlakin</p>
          <p>by Artur Burlakin</p>
        </div>
      </footer>
    </div>
  );
}