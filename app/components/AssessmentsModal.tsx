import React from "react";
import { Dialog } from "@headlessui/react";
import { Assessment, CostSavingSuggestion } from "../types";
import { Eye, PiggyBank, Trash2 } from "lucide-react";

interface Props {
  assessments: Assessment[];
  suggestionsMap: Record<string, CostSavingSuggestion[]>;
  onClose: () => void;
  onSelect: (assessment: Assessment) => void;
  onDelete: (assessmentId: string) => Promise<void>;
  onViewSavings: (assessment: Assessment) => void;
}

export const AssessmentsModal: React.FC<Props> = ({
  assessments,
  suggestionsMap,
  onClose,
  onSelect,
  onDelete,
  onViewSavings,
}) => {
  return (
    <Dialog
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="bg-white max-h-[80vh] overflow-y-auto rounded-xl shadow-xl p-6 w-full max-w-xl z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Your Assessments
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <ul className="space-y-6">
          {assessments.map((a) => {
            const suggestions = suggestionsMap[a.id] || [];
            const savings = suggestions.reduce(
              (sum, s) => sum + (s.estimated_savings || 0),
              0
            );
            const hasSuggestions = suggestions.length > 0;

            return (
              <li
                key={a.id}
                className="border p-6 rounded-xl bg-gray-50 shadow-sm flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left side: Info */}
                <div className="flex-1 space-y-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {a.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    $
                    {typeof a.amount === "number"
                      ? a.amount.toLocaleString()
                      : "0"}
                  </p>
                  {a.dateReceived && (
                    <p className="text-xs text-gray-400">
                      Last updated:{" "}
                      {new Date(a.dateReceived).toLocaleDateString()}
                    </p>
                  )}
                  {hasSuggestions && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Potential Saved: ${savings.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Right side: Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelect(a)}
                    title="View Assessment"
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onViewSavings(a)}
                    title={
                      hasSuggestions ? "View Savings" : "Check for Savings"
                    }
                    className={`p-2 rounded-lg ${
                      hasSuggestions
                        ? "bg-green-100 hover:bg-green-200 text-green-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    <PiggyBank className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onDelete(a.id)}
                    title="Delete Assessment"
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Dialog.Panel>
    </Dialog>
  );
};
