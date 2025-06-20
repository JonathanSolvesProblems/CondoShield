import React, { useState } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, AlertTriangle, CheckCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { CommunityPost } from '../types';

interface CommunityProps {
  t: (key: string) => string;
}

export const Community: React.FC<CommunityProps> = ({ t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('community.all'), icon: MessageSquare },
    { id: 'warning', label: t('community.warnings'), icon: AlertTriangle },
    { id: 'success', label: t('community.success'), icon: CheckCircle },
    { id: 'question', label: t('community.questions'), icon: HelpCircle },
    { id: 'advice', label: t('community.advice'), icon: Lightbulb }
  ];

  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      title: 'WARNING: Excessive Management Fees at Oceanview Condos',
      content: 'Fellow owners at Oceanview Condos in Miami - be aware that our management company has been charging unauthorized administrative fees. I successfully disputed $200 worth of charges using the templates from this platform.',
      author: 'PropertyOwner123',
      region: 'Miami, FL',
      upvotes: 24,
      replies: 8,
      timestamp: '2 days ago',
      category: 'warning'
    },
    {
      id: '2',
      title: 'SUCCESS: Reduced Special Assessment by 40%',
      content: 'Just wanted to share my success story. I challenged a $2,000 special assessment for "emergency" elevator repairs that turned out to be routine maintenance. Used the dispute letter generator and got it reduced to $1,200. Key was requesting detailed invoices and comparing to market rates.',
      author: 'VictoriousOwner',
      region: 'Toronto, ON',
      upvotes: 31,
      replies: 12,
      timestamp: '1 day ago',
      category: 'success'
    },
    {
      id: '3',
      title: 'Question: Can HOA charge for "Future Repairs" fund?',
      content: 'My HOA wants to create a "future repairs" fund and charge each unit $500. This is separate from our existing reserve fund. Is this legal? I\'m in California and our CC&Rs don\'t mention this type of assessment.',
      author: 'ConfusedOwner',
      region: 'Los Angeles, CA',
      upvotes: 15,
      replies: 18,
      timestamp: '3 hours ago',
      category: 'question'
    },
    {
      id: '4',
      title: 'ADVICE: Always Request Board Meeting Minutes',
      content: 'Pro tip for new condo owners: Always request copies of board meeting minutes when you receive unexpected charges. In many jurisdictions, boards must vote on special assessments and the minutes provide evidence of proper procedures. This has saved me twice!',
      author: 'ExperiencedOwner',
      region: 'Vancouver, BC',
      upvotes: 42,
      replies: 7,
      timestamp: '1 week ago',
      category: 'advice'
    },
    {
      id: '5',
      title: 'Late Fee Nightmare at Sunset Gardens',
      content: 'Owners at Sunset Gardens in Phoenix - heads up about their new late fee policy. They\'re charging $75 for payments just 1 day late, even if it\'s due to bank processing delays. This seems excessive and potentially illegal. Anyone else dealing with this?',
      author: 'FrustratedOwner',
      region: 'Phoenix, AZ',
      upvotes: 18,
      replies: 14,
      timestamp: '4 days ago',
      category: 'warning'
    }
  ];

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      warning: AlertTriangle,
      success: CheckCircle,
      question: HelpCircle,
      advice: Lightbulb
    };
    return categoryMap[category as keyof typeof categoryMap] || MessageSquare;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      warning: 'text-orange-600 bg-orange-100',
      success: 'text-green-600 bg-green-100',
      question: 'text-blue-600 bg-blue-100',
      advice: 'text-purple-600 bg-purple-100'
    };
    return colorMap[category as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t('community.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('community.subtitle')}</p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('community.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            {t('community.newPost')}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('community.filter')}:</span>
          <div className="flex space-x-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const CategoryIcon = getCategoryIcon(post.category);
            return (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(post.category)}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>by {post.author}</span>
                        <span>•</span>
                        <span>{post.region}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{post.upvotes} {t('community.upvotes')}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm font-medium">{post.replies} {t('community.replies')}</span>
                    </button>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {categories.find(c => c.id === post.category)?.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};