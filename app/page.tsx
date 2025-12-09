"use client";

import { useState } from "react";
import ExaminationRequestModal from "../components/ExaminationRequestModal";

export default function Home() {
  const [showExamModal, setShowExamModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-violet-100">

      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">MediFill AI</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
          {/* Placeholder Avatar */}
          <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 24H0v-2.153C0 17.432 6.057 14.86 12 14.86s12 2.572 12 6.987V24zM12 2.607c3.48 0 6.302 2.8s6.302 6.253-2.822 6.253-6.302-2.8-6.302-6.253 2.822-6.253 6.302-6.253z" /></svg>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome back, Dr. Farhat
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl">
            What would you like to process today? Select a workflow to get started.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1: Examination Requests (Primary) */}
          <button
            onClick={() => setShowExamModal(true)}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-violet-100 flex flex-col items-start overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 relative z-10">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-violet-700 transition-colors">
              Examination Requests
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Generate submitting forms for Thiqa, Daman, or Nas. Supports MRI, CT, Physiotherapy, and Admissions.
            </p>

            <span className="flex items-center text-violet-600 font-bold group-hover:translate-x-2 transition-transform">
              Start Request
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          {/* Card 2: Placeholder for future features */}
          <div className="bg-white/60 rounded-3xl p-8 border border-gray-100 flex flex-col items-start opacity-60">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-3">
              Lab Reports
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Automated analysis and filing of patient laboratory results.
            </p>
            <span className="mt-auto inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

          {/* Card 3: Placeholder */}
          <div className="bg-white/60 rounded-3xl p-8 border border-gray-100 flex flex-col items-start opacity-60">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-3">
              Appointments
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Manage patient scheduling and automated reminders.
            </p>
            <span className="mt-auto inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

        </div>
      </main>

      {/* Modals */}
      {showExamModal && (
        <ExaminationRequestModal onClose={() => setShowExamModal(false)} />
      )}

    </div>
  );
}
