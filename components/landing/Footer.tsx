'use client';

import React from 'react';

// 푸터 컴포넌트
export default function Footer() {
  return (
    <footer className="bg-sidebar text-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">ReviewPilot</span>
        </div>
        <p className="text-sm">&copy; 2026 ReviewPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
