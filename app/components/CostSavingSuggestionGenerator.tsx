import React, { useEffect, useState } from "react";
import { FileText, Download, Copy, Sparkles } from "lucide-react";
import { Assessment, CostSavingSuggestion } from "../types";
import { supabase } from "../lib/supabaseClient";
import { DisputeLetterGenerator } from "./DisputeLetterGenerator";

interface CostSavingSuggestionGeneratorProps {
  t: (key: string) => string;
  assessments: Assessment[];
  previousSuggestions: Record<string, CostSavingSuggestion[]>;
  initialSelectedId?: string;
}

export const CostSavingSuggestionGenerator: React.FC<
  CostSavingSuggestionGeneratorProps
> = ({ t, assessments, previousSuggestions, initialSelectedId }) => {
  const [selectedId, setSelectedId] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId]);

  useEffect(() => {
    if (selectedId && previousSuggestions[selectedId]) {
      const combined = previousSuggestions[selectedId]
        .map(
          (s) =>
            `• ${s.suggestion} (Save $${s.estimated_savings?.toLocaleString()})`
        )
        .join("\n\n");
      setSuggestion(combined);
    } else {
      setSuggestion(null);
    }
  }, [selectedId, previousSuggestions]);

  const handleGenerate = async () => {
    const assessment = assessments.find((a) => a.id === selectedId);
    if (!assessment) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breakdown: assessment.breakdown }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      if (data.suggestions && data.suggestions.length > 0) {
        // For demo, we concatenate all suggestions text for display
        setSuggestion(
          data.suggestions.map((s: any) => `• ${s.suggestion}`).join("\n")
        );

        // Insert each suggestion as a separate row in Supabase
        const user = (await supabase.auth.getUser()).data.user;
        if (user && data.suggestions?.length) {
          await supabase
            .from("cost_saving_suggestions")
            .delete()
            .eq("user_id", user.id)
            .eq("assessment_id", assessment.id);

          for (const s of data.suggestions) {
            await supabase.from("cost_saving_suggestions").insert({
              user_id: user.id,
              assessment_id: assessment.id,
              suggestion: s.suggestion,
              category: s.category,
              estimated_savings: s.estimated_savings,
            });
          }

          const totalSavings = data.suggestions.reduce(
            (sum: number, s: any) => sum + (s.estimated_savings ?? 0),
            0
          );

          await supabase.from("user_activity_logs").insert({
            user_id: user.id,
            type: "saving",
            title: "Cost Savings Generated",
            description: `Generated ${
              data.suggestions.length
            } suggestions totaling $${totalSavings.toLocaleString()}`,
          });
        }
      } else {
        setSuggestion("No suggestions were generated.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (suggestion) navigator.clipboard.writeText(suggestion);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          {t("savings.title")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("savings.subtitle")}
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("savings.selectAssessment")}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select an assessment...</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} — ${a.amount.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedId || loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
              <span>{t("savings.generating")}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>{t("savings.generate")}</span>
            </>
          )}
        </button>
      </div>

      {suggestion && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCopy}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Copy className="h-5 w-5" />
              <span>{t("savings.copy")}</span>
            </button>
            <DisputeLetterGenerator
              aiText={generateSavingsSummary(previousSuggestions[selectedId])}
            />
          </div>

          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {t("savings.resultHeader")}
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
              {suggestion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const generateSavingsSummary = (items: CostSavingSuggestion[]): string => {
  if (!items || items.length === 0) {
    return "After reviewing your assessment, no immediate cost-saving opportunities were found.";
  }
  const total = items.reduce((sum, s) => sum + (s.estimated_savings || 0), 0);
  const lines = items.map(
    (s, i) =>
      `${i + 1}. ${
        s.suggestion
      } (Est. Savings: $${s.estimated_savings?.toLocaleString()})`
  );
  return [
    `Subject: Recommendations for Cost Savings`,
    ``,
    `Based on your condo assessment, here are some actionable cost-saving suggestions totaling an estimated $${total.toLocaleString()}:`,
    ``,
    ...lines,
    ``,
    `We recommend reviewing these items and discussing them with your association board or property manager.`,
    ``,
    `Sincerely,`,
    `[Your Name]`,
  ].join("\n");
};
