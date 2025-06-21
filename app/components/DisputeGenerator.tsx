import React, { useState } from 'react';
import { FileText, Download, Copy, Send } from 'lucide-react';
import { Assessment } from '../types';

interface DisputeGeneratorProps {
  t: (key: string) => string;
  assessments: Assessment[];
}

export const DisputeGenerator: React.FC<DisputeGeneratorProps> = ({ t, assessments }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTitle, setRecipientTitle] = useState('Property Manager');
  const [concerns, setConcerns] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateLetter = async () => {
    if (!selectedAssessment || !recipientName || !concerns) return;
    
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const assessment = assessments.find(a => a.id === selectedAssessment);
    const today = new Date().toLocaleDateString();
    
    const letter = `[Your Name]
[Your Address]
[City, State/Province, Postal Code]
[Email Address]
[Phone Number]

${today}

${recipientName}
${recipientTitle}
[Property Management Company]
[Address]

Re: Dispute of Assessment - ${assessment?.title}
Assessment Amount: $${assessment?.amount.toLocaleString()}
Due Date: ${assessment?.dueDate}

Dear ${recipientName},

I am writing to formally dispute the above-referenced assessment for the following reasons:

${concerns}

As a property owner, I have the right to receive clear and detailed information about all charges and assessments. I request that you provide the following documentation:

1. Detailed breakdown of all costs included in this assessment
2. Copies of invoices, contracts, or receipts supporting the charges
3. Board meeting minutes documenting the approval of this assessment
4. Evidence that proper notice procedures were followed as required by our governing documents
5. Justification for any administrative or processing fees included

Legal Basis for This Request:
Property owners have established rights under [applicable local property law] to transparency in assessment procedures and the right to challenge charges that appear excessive or improperly authorized.

Requested Action:
I respectfully request that this assessment be suspended pending your response to this dispute and provision of the requested documentation. Upon review of the documentation, I am willing to pay any legitimately authorized and properly documented charges.

I look forward to your prompt response within [applicable time frame per local law/governing documents] days. Please contact me at [your phone] or [your email] to discuss this matter.

Thank you for your attention to this matter.

Sincerely,

[Your Signature]
[Your Printed Name]
[Unit Number/Property Address]

---

Enclosures: Copy of original assessment notice

IMPORTANT NOTICE: This letter is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for specific legal counsel regarding your situation.`;

    setGeneratedLetter(letter);
    setGenerating(false);
  };

  const handleCopyLetter = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
    }
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log('Downloading PDF...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t('generator.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('generator.subtitle')}</p>
      </div>

      {!generatedLetter ? (
        /* Form */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Assessment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('generator.selectAssessment')}
              </label>
              <select
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an assessment...</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} - ${assessment.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('generator.recipientName')}
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('generator.recipientTitle')}
                </label>
                <input
                  type="text"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  placeholder="Property Manager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Concerns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('generator.yourConcerns')}
              </label>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder={t('generator.concernsPlaceholder')}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateLetter}
              disabled={!selectedAssessment || !recipientName || !concerns || generating}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Letter...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>{t('generator.generateLetter')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Generated Letter */
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>{t('generator.downloadPdf')}</span>
            </button>
            <button
              onClick={handleCopyLetter}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Copy className="h-5 w-5" />
              <span>{t('generator.copyText')}</span>
            </button>
            <button
              onClick={() => setGeneratedLetter(null)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Generate Another
            </button>
          </div>

          {/* Letter Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Your Dispute Letter
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-line">
                {generatedLetter}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Success:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep copies of all correspondence</li>
              <li>• Send via certified mail for proof of delivery</li>
              <li>• Follow up if no response within the stated timeframe</li>
              <li>• Consider consulting a local attorney for complex disputes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};