import React, { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
} from "recharts";
import { Assessment, AssessmentItem } from "../types";
import { supabase } from "../lib/supabaseClient";
import { DisputeLetterGenerator } from "./DisputeLetterGenerator";
import { logUserActivity } from "../lib/activityLogger";
import { formatLanguageForPrompt } from "../lib/fetchUserLanguage";

interface AssessmentAnalyzerProps {
  t: (key: string) => string;
  selectedAssessment?: Assessment | null;
  language: string;
}

const saveAnalysisToDB = async (
  results: AssessmentItem[],
  fileName: string
) => {
  const user = (await supabase.auth.getUser()).data.user;

  if (user) {
    await supabase.from("assessment_analyses").upsert({
      user_id: user.id,
      uploaded_file_name: fileName,
      results: results,
      updated_at: new Date().toISOString(),
    });
  }
};

export const AssessmentAnalyzer: React.FC<AssessmentAnalyzerProps> = ({
  t,
  selectedAssessment,
  language = "en",
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AssessmentItem[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAssessment?.breakdown) {
      setResults(selectedAssessment.breakdown);
    } else {
      setResults(null);
    }
  }, [selectedAssessment]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setError("Please upload a PDF or image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("languageNote", formatLanguageForPrompt(language));

    try {
      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze file");
      }

      const data = await response.json();
      setResults(data);

      await saveAnalysisToDB(data, file.name);
      const user = (await supabase.auth.getUser()).data.user;

      if (user) {
        await logUserActivity({
          userId: user.id,
          type: "assessment",
          title: "New Special Assessment Analyzed",
          description: `File analyzed: ${file.name}, total amount: $${data
            .reduce((sum, item) => sum + item.amount, 0)
            .toLocaleString()}`,
        });
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const totalAmount = results?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const questionableAmount =
    results
      ?.filter((item) => item.questionable)
      .reduce((sum, item) => sum + item.amount, 0) || 0;
  const normalAmount = totalAmount - questionableAmount;

  const pieData = [
    { name: t("analyzer.normal"), value: normalAmount, color: "#10B981" },
    {
      name: t("analyzer.questionable"),
      value: questionableAmount,
      color: "#F59E0B",
    },
  ];

  const barData =
    results?.map((item) => ({
      category: item.category,
      amount: item.amount,
      questionable: item.questionable,
    })) || [];

  const toAssessments = (items: AssessmentItem[]): Assessment[] => {
    return [
      {
        id: "auto-generated-" + Date.now(), // unique ID for tracking
        title: "Assessment Analysis", // or extract a better title if available
        amount: items.reduce((sum, item) => sum + item.amount, 0),
        dueDate: new Date().toISOString().split("T")[0], // fallback to today
        status: "disputed", // or default to "pending"
        description: "Auto-generated assessment from uploaded analysis.",
        breakdown: items, // this is your original results
        region: "Default Region", // you can later prompt or infer this
        dateReceived: new Date().toISOString().split("T")[0],
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          {t("analyzer.title")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("analyzer.subtitle")}
        </p>
      </div>

      {/* Upload Section */}
      {!results && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* <div className="flex justify-center space-x-4 mb-6">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {t("analyzer.upload")}
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                {t("analyzer.manual")}
              </button>
            </div> */}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {analyzing ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">{t("analyzer.processing")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {t("analyzer.dragDrop")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("analyzer.fileTypes")}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("analyzer.results")}
            </h3>
            <p className="text-gray-600">Assessment analyzed and categorized</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("analyzer.questionable")}
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${questionableAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("analyzer.normal")}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${normalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                {t("analyzer.breakdown")}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <defs>
                      <linearGradient
                        id="normalGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient
                        id="questionableGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "url(#normalGradient)"
                              : "url(#questionableGradient)"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {t("analyzer.normal")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {t("analyzer.questionable")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Individual Charges
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.questionable ? "#F59E0B" : "#10B981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">
                Detailed Analysis
              </h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {results.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        item.questionable ? "bg-orange-100" : "bg-green-100"
                      }`}
                    >
                      {item.questionable ? (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">
                          {item.category}
                        </h5>
                        <span className="text-lg font-bold text-gray-900">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      {item.questionable && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          This charge may warrant further review
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setResults(null);
                setError(null);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Analyze Another
            </button>
            <DisputeLetterGenerator
              aiText={generateDisputeSummary(results)}
              t={t}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function generateDisputeSummary(
  items: {
    amount: number;
    category: string;
    description: string;
    questionable: boolean;
  }[]
): string {
  const questionableItems = items.filter((item) => item.questionable);

  if (questionableItems.length === 0) {
    return "After reviewing the financial breakdown, I found no questionable charges.";
  }

  const total = questionableItems.reduce((sum, item) => sum + item.amount, 0);
  const lines = questionableItems.map(
    (item) =>
      `- ${item.description} (${
        item.category
      }): $${item.amount.toLocaleString()}`
  );

  return [
    `Subject: Dispute of Questionable Condo Charges`,
    ``,
    `I have reviewed the financial statement and identified the following charges that I believe require clarification or justification:`,
    ``,
    ...lines,
    ``,
    `These charges amount to a total of $${total.toLocaleString()}.`,
    `Please provide a detailed explanation, supporting documentation, and justification for each of these charges. If these cannot be justified, I request they be removed or corrected.`,
    ``,
    `Thank you.`,
  ].join("\n");
}
