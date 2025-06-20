'use client';

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AssessmentAnalyzer } from './components/AssessmentAnalyzer';
import { LegalAssistant } from './components/LegalAssistant';
import { Community } from './components/Community';
import { DisputeGenerator } from './components/DisputeGenerator';
import { useTranslation } from './hooks/useLanguage';
import { Language, Assessment } from './types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

  // Mock data for assessments
  const mockAssessments: Assessment[] = [
    {
      id: '1',
      title: 'Pool Renovation Special Assessment',
      amount: 1200,
      dueDate: '2025-02-15',
      status: 'pending',
      description: 'Special assessment for pool renovation and equipment upgrade',
      breakdown: [
        { category: 'Pool Resurfacing', amount: 800, description: 'Pool surface repair and refinishing', questionable: false },
        { category: 'Equipment Upgrade', amount: 300, description: 'New pool pump and filtration system', questionable: false },
        { category: 'Administrative Fee', amount: 100, description: 'Processing and management fee', questionable: true }
      ],
      region: 'Miami, FL',
      dateReceived: '2025-01-10'
    },
    {
      id: '2',
      title: 'Emergency Elevator Repair',
      amount: 750,
      dueDate: '2025-01-25',
      status: 'disputed',
      description: 'Emergency assessment for elevator repair',
      breakdown: [
        { category: 'Repair Service', amount: 600, description: 'Elevator repair and parts', questionable: false },
        { category: 'Emergency Fee', amount: 150, description: 'After-hours service charge', questionable: true }
      ],
      region: 'Toronto, ON',
      dateReceived: '2025-01-05'
    },
    {
      id: '3',
      title: 'Parking Lot Maintenance',
      amount: 450,
      dueDate: '2025-03-01',
      status: 'pending',
      description: 'Annual parking lot sealing and line painting',
      breakdown: [
        { category: 'Sealing Service', amount: 350, description: 'Asphalt sealing and crack repair', questionable: false },
        { category: 'Line Painting', amount: 100, description: 'Parking space line repainting', questionable: false }
      ],
      region: 'Vancouver, BC',
      dateReceived: '2025-01-12'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard t={t} assessments={mockAssessments} />;
      case 'analyzer':
        return <AssessmentAnalyzer t={t} />;
      case 'legal':
        return <LegalAssistant t={t} />;
      case 'community':
        return <Community t={t} />;
      case 'generator':
        return <DisputeGenerator t={t} assessments={mockAssessments} />;
      default:
        return <Dashboard t={t} assessments={mockAssessments} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        language={language}
        onLanguageChange={setLanguage}
        t={t}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}