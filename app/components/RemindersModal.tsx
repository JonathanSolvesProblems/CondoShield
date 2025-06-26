import { Calendar, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import React, { useEffect, useState } from "react";

export const RemindersModal = ({ onClose }: { onClose: () => void }) => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("user_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch reminders:", error);
    } else {
      setReminders(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDelete = async (id: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("user_reminders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete reminder:", error);
      return;
    }

    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">All Reminders</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <p className="text-gray-500 text-center">No reminders found.</p>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start space-x-4 border-b pb-4"
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {reminder.title || "Reminder"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reminder.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(reminder.due_date).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-600 hover:text-red-800 ml-4 self-start"
                  title="Delete Reminder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
