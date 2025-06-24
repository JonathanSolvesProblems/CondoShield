import React from "react";
import { Dialog } from "@headlessui/react";
import { Assessment } from "../types";
import { Trash2 } from "lucide-react";

interface Props {
  assessments: Assessment[];
  onClose: () => void;
  onSelect: (assessment: Assessment) => void;
  onDelete: (assessmentId: string) => Promise<void>;
}

export const AssessmentsModal: React.FC<Props> = ({
  assessments,
  onClose,
  onSelect,
  onDelete,
}) => {
  return (
    <Dialog
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="bg-white max-h-[80vh] overflow-y-auto rounded-xl shadow-xl p-6 w-full max-w-xl z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Assessments</h3>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>
        <ul className="space-y-4">
          {assessments.map((a) => (
            <li
              key={a.id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-gray-500">
                  $
                  {typeof a.amount === "number"
                    ? a.amount.toLocaleString()
                    : "0"}
                </p>
                {a.dateReceived && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated by: {a.dateReceived}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onSelect(a)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  Show Assessment
                </button>

                <button
                  onClick={() => onDelete(a.id)}
                  aria-label={`Delete assessment ${a.title}`}
                  className="text-sm flex items-center bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Dialog.Panel>
    </Dialog>
  );
};
