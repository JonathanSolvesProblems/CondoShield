import React, { useState } from 'react';
import { MessageCircle, HelpCircle, BookOpen, MapPin, Send } from 'lucide-react';

interface LegalAssistantProps {
  t: (key: string) => string;
}

export const LegalAssistant: React.FC<LegalAssistantProps> = ({ t }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const commonQuestions = [
    {
      id: '1',
      question: 'Can I refuse to pay a special assessment without detailed breakdown?',
      category: 'Assessment Rights',
      region: 'General'
    },
    {
      id: '2',
      question: 'What are my rights when charged excessive late fees?',
      category: 'Fee Disputes',
      region: 'General'
    },
    {
      id: '3',
      question: 'How long does my HOA have to provide financial documentation?',
      category: 'Documentation Rights',
      region: 'General'
    },
    {
      id: '4',
      question: 'Can emergency assessments be charged without owner approval?',
      category: 'Emergency Fees',
      region: 'General'
    }
  ];

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response based on question
    const mockAnswer = `Based on your location and the nature of your question, here's what you should know:

**Your Legal Rights:**
Property owners typically have the right to request detailed breakdowns of all charges and assessments. Most jurisdictions require HOAs and condo associations to provide transparency in their financial operations.

**Recommended Actions:**
1. Request a detailed written explanation of all charges
2. Review your governing documents (CC&Rs, bylaws) for assessment procedures
3. Check local property law requirements for your region
4. Consider attending the next board meeting to raise your concerns

**Important Considerations:**
- Time limits may apply for disputing charges
- Some jurisdictions have specific procedures for challenging assessments
- Documentation of all communications is crucial

**Next Steps:**
Consider generating a formal dispute letter using our Letter Generator tool to ensure your concerns are properly documented and communicated.

*This guidance is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for specific legal counsel.*`;
    
    setAnswer(mockAnswer);
    setLoading(false);
  };

  const handleCommonQuestion = (questionText: string) => {
    setQuestion(questionText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t('legal.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('legal.subtitle')}</p>
      </div>

      {/* Region Selection */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Your Region: North America (Canada/USA)</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Legal guidance will be tailored to your jurisdiction. 
            <button className="underline ml-1 hover:text-blue-800">Change region</button>
          </p>
        </div>
      </div>

      {/* Question Input */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            {t('legal.askQuestion')}
          </h3>
          
          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('legal.placeholder')}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <button
              onClick={handleSubmitQuestion}
              disabled={!question.trim() || loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('legal.processing')}</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>{t('legal.submit')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Answer */}
      {answer && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Legal Guidance
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              {answer.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                  return (
                    <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
                      {paragraph.replace(/\*\*/g, '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                  return (
                    <p key={index} className="text-sm text-gray-500 italic mt-4 p-3 bg-gray-50 rounded-lg">
                      {paragraph.replace(/\*/g, '')}
                    </p>
                  );
                }
                if (paragraph.trim()) {
                  return <p key={index} className="mb-3">{paragraph}</p>;
                }
                return null;
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Generate Dispute Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Common Questions */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              {t('legal.commonQuestions')}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleCommonQuestion(q.question)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{q.category}</span>
                    <span>{q.region}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};