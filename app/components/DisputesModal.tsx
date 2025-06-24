import React, { useState } from "react";
import { DisputeLetter } from "../types";

interface DisputesModalProps {
  disputes: DisputeLetter[];
  onClose: () => void;
  onMarkResolved: (id: string) => Promise<void>;
}

export const DisputesModal: React.FC<DisputesModalProps> = ({
  disputes,
  onClose,
  onMarkResolved,
}) => {
  const [selectedDispute, setSelectedDispute] = useState<DisputeLetter | null>(
    null
  );
  const [loadingResolve, setLoadingResolve] = useState(false);

  const handleResolve = async () => {
    if (!selectedDispute) return;
    setLoadingResolve(true);
    await onMarkResolved(selectedDispute.id);
    setSelectedDispute(null);
    setLoadingResolve(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex overflow-hidden">
        {/* Left panel: dispute list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Disputes</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close disputes modal"
            >
              ✕
            </button>
          </div>
          {disputes.length === 0 ? (
            <p className="p-4 text-gray-500">No active disputes.</p>
          ) : (
            <ul>
              {disputes.map((d) => (
                <li
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                    selectedDispute?.id === d.id ? "bg-gray-100" : ""
                  }`}
                >
                  <p className="font-medium text-gray-900 truncate">
                    {d.content?.slice(0, 40) || "Untitled Dispute"}...
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Generated on:{" "}
                    {new Date(d.dateGenerated).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right panel: dispute details */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {selectedDispute ? (
            <>
              <h4 className="text-xl font-semibold mb-4">
                Dispute generated on{" "}
                {new Date(selectedDispute.dateGenerated).toLocaleDateString()}
              </h4>
              <div className="prose max-w-none whitespace-pre-wrap mb-6">
                {selectedDispute.content}
              </div>
              <button
                disabled={loadingResolve}
                onClick={handleResolve}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loadingResolve ? "Marking..." : "Mark as Resolved"}
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a dispute to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
