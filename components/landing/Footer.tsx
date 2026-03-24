'use client';

import React from 'react';

// 푸터 컴포넌트
export default function Footer() {
  return (
    <footer className="bg-sidebar text-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tight">RP</span>
          </div>
          <span className="text-white font-semibold text-sm">ReviewPilot</span>
        </div>
        <p className="text-sm">&copy; 2026 ReviewPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
