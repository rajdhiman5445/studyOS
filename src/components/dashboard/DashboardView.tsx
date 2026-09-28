import React, { useState } from 'react';
import { Header } from '../layout/Header';
import { MustDealWith } from './MustDealWith';
import { TodaysPlan } from './TodaysPlan';
import { RevisionDue } from './RevisionDue';
import { StudyTimeSummary } from './StudyTimeSummary';
import { RecentNotes } from './RecentNotes';
import { QuickCaptureModal } from './QuickCaptureModal';

export const DashboardView: React.FC = () => {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Header
        title="Dashboard"
        subtitle="Master of Science in Robotics Engineering • Active Workspace"
        onOpenQuickCapture={() => setQuickCaptureOpen(true)}
      />

      {/* Mobile-first: Study Time & Progress at the top on small screens */}
      <div className="block lg:hidden">
        <StudyTimeSummary />
      </div>

      {/* Spacious, balanced two-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Primary Execution Column (wider, clear focus) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
          {/* 1. What must I deal with? (Highest visual priority) */}
          <MustDealWith />

          {/* 2. Today's Plan */}
          <TodaysPlan onOpenQuickCapture={() => setQuickCaptureOpen(true)} />
        </div>

        {/* Supporting Progress & Revision Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sm:space-y-8">
          {/* Desktop-only: Study Time & Progress in the secondary column */}
          <div className="hidden lg:block">
            <StudyTimeSummary />
          </div>

          {/* 4. Revision Due */}
          <RevisionDue />

          {/* 5. Quick Captures & Notes */}
          <RecentNotes onOpenQuickCapture={() => setQuickCaptureOpen(true)} />
        </div>
      </div>

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </div>
  );
};
