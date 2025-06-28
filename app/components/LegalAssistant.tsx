import React, { useState } from "react";
import {
  MessageCircle,
  HelpCircle,
  BookOpen,
  MapPin,
  Send,
} from "lucide-react";
import { RegionSelectorModal } from "./RegionSelectorModal";
import { DisputeLetterGenerator } from "./DisputeLetterGenerator";
import { logUserActivity } from "../lib/activityLogger";
import { supabase } from "../lib/supabaseClient";
import { formatLanguageForPrompt } from "../lib/fetchUserLanguage";

interface LegalAssistantProps {
  t: (key: string) => string;
  initialRegion: string;
  onRegionUpdated?: () => void;
  language: string;
  initialQuestion?: string;
  initialAnswer?: string | null;
}

export const LegalAssistant: React.FC<LegalAssistantProps> = ({
  t,
  initialRegion,
  onRegionUpdated,
  language = "en",
  initialQuestion,
  initialAnswer,
}) => {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(initialAnswer || null);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  const [showRegionModal, setShowRegionModal] = useState(false);

  const commonQuestions = [
    {
      id: "1",
      question: t("legal.commonQuestion1"),
      category: t("assessmentRights"),
      region: t("general"),
    },
    {
      id: "2",
      question: t("legal.commonQuestion2"),
      category: t("feeDisputes"),
      region: t("general"),
    },
    {
      id: "3",
      question: t("legal.commonQuestion3"),
      category: t("documentationRights"),
      region: t("general"),
    },
    {
      id: "4",
      question: t("legal.commonQuestion4"),
      category: t("emergencyFees"),
      region: t("general"),
    },
  ];

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const response = await fetch("/api/analyze-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          region: selectedRegion,
          languageNote: formatLanguageForPrompt(language),
        }),
      });

      const data = await response.json();
      setAnswer(data.answer || "Sorry, no response received.");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user && data.answer) {
        await logUserActivity({
          userId: user.id,
          type: "legal",
          title: question,
          description: `${t("askedLegalQuestion")} ${selectedRegion}`,
        });

        await supabase.from("legal_assistant_sessions").insert([
          {
            user_id: user.id,
            question,
            answer: data.answer,
            region: selectedRegion,
            language,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setAnswer("There was an error processing your question.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommonQuestion = (questionText: string) => {
    setQuestion(questionText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t("legal.title")}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t("legal.subtitle")}</p>
      </div>

      {/* Region Selection */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">
              {t("yourRegion")} {selectedRegion}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {t("legalGuidance")}
            <button
              className="underline ml-1 hover:text-blue-800"
              onClick={() => setShowRegionModal(true)}
            >
              {t("changeRegion")}
            </button>
          </p>
        </div>
      </div>

      {showRegionModal && (
        <RegionSelectorModal
          onClose={() => setShowRegionModal(false)}
          onSelect={(region) => setSelectedRegion(region)}
          onRegionUpdated={onRegionUpdated}
          initialRegion={initialRegion}
          t={t}
        />
      )}

      {/* Question Input */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            {t("legal.askQuestion")}
          </h3>

          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("legal.placeholder")}
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
                  <span>{t("legal.processing")}</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>{t("legal.submit")}</span>
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
              {t("legalGuid")}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              {answer.split("\n").map((paragraph, index) => {
                if (paragraph.startsWith("**") && paragraph.endsWith(":**")) {
                  return (
                    <h4
                      key={index}
                      className="font-semibold text-gray-900 mt-4 mb-2"
                    >
                      {paragraph.replace(/\*\*/g, "")}
                    </h4>
                  );
                }
                if (paragraph.startsWith("*") && paragraph.endsWith("*")) {
                  return (
                    <p
                      key={index}
                      className="text-sm text-gray-500 italic mt-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {paragraph.replace(/\*/g, "")}
                    </p>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <DisputeLetterGenerator
                aiText={answer || ""}
                t={t}
                language={language}
              />
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
              {t("legal.commonQuestions")}
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
                  <h4 className="font-medium text-gray-900 mb-2">
                    {q.question}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {q.category}
                    </span>
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
