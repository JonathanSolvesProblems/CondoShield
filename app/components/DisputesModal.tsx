import React from "react";
import { DisputeLetter } from "../types";
import { X } from "lucide-react";

interface DisputesModalProps {
  disputes: DisputeLetter[];
  onClose: () => void;
  onMarkResolved: (id: string) => Promise<void>;
  onSelectDispute: (dispute: DisputeLetter) => void;
  t: (key: string) => string;
}

export const DisputesModal: React.FC<DisputesModalProps> = ({
  disputes,
  onClose,
  onMarkResolved,
  onSelectDispute,
  t,
}) => {
  const handleResolve = async (id: string) => {
    await onMarkResolved(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close disputes modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Active Disputes</h3>
        </div>

        {disputes.length === 0 ? (
          <p className="p-4 text-gray-500">No active disputes.</p>
        ) : (
          <ul>
            {disputes.map((d) => (
              <li
                key={d.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectDispute(d)}
                >
                  <p className="font-medium text-gray-900 truncate">
                    {d.content?.slice(0, 40) || "Untitled Dispute"}...
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {t("generatedOn")}{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(d.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                  title="Mark as Resolved"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
