import React from 'react';
import UserDashboard from './UserDashboard';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, LogOut } from 'lucide-react';

/**
 * UserDashboardPage – premium wrapper for the citizen dashboard.
 * Handles navigation, displays a stylish page header and renders the core
 * UserDashboard component which shows complaints and token balance.
 */
export default function UserDashboardPage({ userAadhar, onLogout, onNewGrievance }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-navy/5 to-gov-saffron/5">
      {/* Page Header */}
      <header className="bg-gov-navy text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">
            {t('dashboard.title', 'User Dashboard')}
          </h1>
          <div className="flex items-center gap-4">
            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content – the core dashboard component */}
      <main className="max-w-5xl mx-auto p-6">
        {/* The underlying UserDashboard already provides its own header with token balance.
            It also offers the "File New Grievance" button which triggers onNewGrievance. */}
        <UserDashboard
          userAadhar={userAadhar}
          onNewGrievance={onNewGrievance}
          onLogout={onLogout}
        />
      </main>
    </div>
  );
}
