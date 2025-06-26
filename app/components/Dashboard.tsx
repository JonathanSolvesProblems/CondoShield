import React, { useState } from "react";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  PiggyBank,
  Gavel,
} from "lucide-react";
import { Assessment, CostSavingSuggestion, DisputeLetter } from "../types";
import { supabase } from "../lib/supabaseClient";
import { DisputesModal } from "./DisputesModal";
import { AssessmentsModal } from "./AssessmentsModal";
import { ActivityModal } from "./ActivityModal";
import { DisputeLetterGenerator } from "./DisputeLetterGenerator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DashboardProps {
  t: (key: string) => string;
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  onAssessmentSelect: (assessment: Assessment) => void;
  disputes: DisputeLetter[];
  setDisputes: React.Dispatch<React.SetStateAction<DisputeLetter[]>>;
  userActivityLogs: any[];
  savedAmount: number;
  suggestionsMap: Record<string, CostSavingSuggestion[]>;
  onViewSavings: (assessment: Assessment) => void;
  reminders: any[];
  setReminders: React.Dispatch<React.SetStateAction<any[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  t,
  assessments,
  setAssessments,
  onAssessmentSelect,
  disputes,
  setDisputes,
  userActivityLogs,
  savedAmount,
  suggestionsMap,
  onViewSavings,
  reminders,
  setReminders,
}) => {
  const totalAssessments = assessments.length;
  const activeDisputes = disputes.length;
  const [isDisputesOpen, setIsDisputesOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeLetter | null>(
    null
  );
  const [isAssessmentsOpen, setIsAssessmentsOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const totalAmount = assessments.reduce((total, assessment) => {
    if (!assessment.breakdown || assessment.breakdown.length === 0)
      return total;
    const sum = assessment.breakdown.reduce(
      (acc, item) => acc + (item.amount || 0),
      0
    );
    return total + sum;
  }, 0);

  const savedAmountFormatted = (savedAmount ?? 0).toLocaleString();

  const markResolved = async (id: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("dispute_letters")
      .update({ status: "resolved" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking dispute resolved:", error);
      return;
    }

    // Refresh disputes list
    const { data } = await supabase
      .from("dispute_letters")
      .select("*")
      .eq("status", "active")
      .eq("user_id", user.id);

    setDisputes(data ?? []);
    setSelectedDispute(null);
  };

  const recentActivity = userActivityLogs.map((log) => {
    // Map your table fields to match mock data format
    // Use appropriate icon & color depending on log.type
    let icon = FileText;
    let color = "text-blue-600";

    switch (log.type) {
      case "dispute":
        icon = AlertTriangle;
        color = "text-orange-600";
        break;

      case "success":
        icon = CheckCircle;
        color = "text-green-600";
        break;

      case "community":
        icon = Users;
        color = "text-blue-600";
        break;

      case "saving":
        icon = PiggyBank;
        color = "text-green-600";
        break;

      case "legal":
        icon = Gavel;
        color = "text-purple-600";
        break;

      default:
        break;
    }

    // Format time like "2 hours ago"
    const timeAgo = (() => {
      const diffMs = Date.now() - new Date(log.timestamp).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    })();

    return {
      id: log.id,
      type: log.type,
      title: log.title ?? "(No Title)",
      description: log.description ?? "",
      time: timeAgo,
      icon,
      color,
    };
  });

  const upcomingDeadlines = [
    ...assessments
      .filter((a) => a.status === "pending" && a.dueDate)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: "",
        dueDate: a.dueDate,
        isCustom: false,
        amount: a.amount,
      })),
    ...reminders.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      dueDate: r.due_date,
      isCustom: true,
      amount: null,
    })),
  ]
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const handleDeleteAssessment = async (id: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("assessment_analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting assessment:", error.message);
      return;
    }

    // Remove from local state so UI updates immediately
    const updatedAssessments = assessments.filter((a) => a.id !== id);
    setAssessments(updatedAssessments);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => setIsAssessmentsOpen(true)}
          className="cursor-pointer bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.totalAssessments")}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalAssessments}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer"
          onClick={() => setIsDisputesOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.activeDisputes")}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {activeDisputes}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600 underline font-medium">
            View Disputes
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.savedAmount")}
              </p>
              <p className="text-3xl font-bold text-green-600">
                ${savedAmountFormatted}
              </p>
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
              <h3 className="text-lg font-semibold text-gray-900">
                {t("dashboard.recentActivity")}
              </h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setShowActivityModal(true)}
              >
                {t("dashboard.viewAll")}
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {t("dashboard.noActivity")}
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {/* Upcoming Deadlines + Custom Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Deadlines
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming deadlines
              </p>
            ) : (
              upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.isCustom
                        ? item.description
                        : `$${item.amount?.toLocaleString() ?? "N/A"}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Due date</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Reminder Form */}
          <div className="p-6 border-t border-gray-200 mt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Add Custom Reminder
            </h4>

            <div className="space-y-4">
              <DatePicker
                selected={
                  newReminder.due_date ? new Date(newReminder.due_date) : null
                }
                onChange={(date) =>
                  setNewReminder((prev) => ({
                    ...prev,
                    due_date: date?.toISOString() || "",
                  }))
                }
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Select date and time"
                className="w-full p-2 border rounded"
              />

              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={newReminder.description}
                onChange={(e) =>
                  setNewReminder((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={newReminder.due_date}
                onChange={(e) =>
                  setNewReminder((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
              />
              <button
                onClick={async () => {
                  const user = (await supabase.auth.getUser()).data.user;
                  if (!user) return;

                  const { data, error } = await supabase
                    .from("user_reminders")
                    .insert({
                      user_id: user.id,
                      title: newReminder.title,
                      description: newReminder.description,
                      due_date: new Date(newReminder.due_date).toISOString(),
                      type: "system",
                    })
                    .select()
                    .single();

                  if (error) {
                    console.error("Failed to add reminder", error);
                    return;
                  }

                  setReminders((prev) => [...prev, data]);
                  setNewReminder({ title: "", description: "", due_date: "" });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
      {isDisputesOpen && (
        <DisputesModal
          disputes={disputes}
          onClose={() => {
            setIsDisputesOpen(false);
            setSelectedDispute(null);
          }}
          onMarkResolved={async (id: string) => {
            await markResolved(id);
            // refresh disputes list after resolving
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;
            const { data } = await supabase
              .from("dispute_letters")
              .select("*")
              .eq("status", "active")
              .eq("user_id", user.id);
            setDisputes(data ?? []);
          }}
          onSelectDispute={(dispute) => {
            setSelectedDispute(dispute); // set the selected dispute for editing
            setIsDisputesOpen(false); // optionally close the modal
          }}
        />
      )}

      {selectedDispute && (
        <DisputeLetterGenerator
          preloadedLetter={selectedDispute.content}
          openExternally={true}
        />
      )}

      {isAssessmentsOpen && (
        <AssessmentsModal
          assessments={assessments}
          suggestionsMap={suggestionsMap}
          onClose={() => setIsAssessmentsOpen(false)}
          onSelect={(assessment) => {
            onAssessmentSelect(assessment);
            setIsAssessmentsOpen(false);
          }}
          onDelete={handleDeleteAssessment}
          onViewSavings={(assessment) => {
            onViewSavings(assessment);
            setIsAssessmentsOpen(false);
          }}
        />
      )}

      {showActivityModal && (
        <ActivityModal onClose={() => setShowActivityModal(false)} />
      )}
    </div>
  );
};
