import React from 'react';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Assessment } from '../types';

interface DashboardProps {
  t: (key: string) => string;
  assessments: Assessment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ t, assessments }) => {
  const totalAssessments = assessments.length;
  const activeDisputes = assessments.filter(a => a.status === 'disputed').length;
  const totalAmount = assessments.reduce((sum, a) => sum + a.amount, 0);
  const savedAmount = 2500; // Mock saved amount

  const recentActivity = [
    {
      id: '1',
      type: 'assessment',
      title: 'New Special Assessment Analyzed',
      description: 'Pool renovation fee - $850',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'dispute',
      title: 'Dispute Letter Generated',
      description: 'Parking fee dispute letter created',
      time: '1 day ago',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: '3',
      type: 'success',
      title: 'Assessment Reduced',
      description: 'Maintenance fee reduced by $200',
      time: '3 days ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const upcomingDeadlines = assessments
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.totalAssessments')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalAssessments}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.activeDisputes')}</p>
              <p className="text-3xl font-bold text-gray-900">{activeDisputes}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.savedAmount')}</p>
              <p className="text-3xl font-bold text-green-600">${savedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentActivity')}</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('dashboard.viewAll')}
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('dashboard.noActivity')}</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((assessment) => (
                  <div key={assessment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                      <p className="text-sm text-gray-500">${assessment.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(assessment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Due date</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};