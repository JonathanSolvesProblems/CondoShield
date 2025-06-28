import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Gavel,
  PiggyBank,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export const ActivityModal = ({
  onClose,
  t,
}: {
  onClose: () => void;
  t: (key: string) => string;
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const fetchActivities = async (page: number) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("user_activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching activity logs:", error.message);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((log) => {
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
      }

      const diffMs = Date.now() - new Date(log.timestamp).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const time =
        diffMinutes < 60
          ? `${diffMinutes} ${t("minAgo")}`
          : diffMinutes < 1440
          ? `${Math.floor(diffMinutes / 60)} ${t("hrsAgo")}`
          : `${Math.floor(diffMinutes / 1440)} ${t("daysAgo")}`;

      return {
        ...log,
        icon,
        color,
        time,
      };
    });

    setActivities((prev) => [...prev, ...formatted]);
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchActivities(0); // initial load
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("allActivity")}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {loading && activities.length === 0 ? (
            <p className="text-gray-500 text-center">{t("loadingActivity")}</p>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-center">{t("noActivityFound")}</p>
          ) : (
            <>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 border-b pb-4"
                >
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

              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    className="text-blue-600 hover:underline font-medium text-sm"
                    onClick={handleLoadMore}
                  >
                    {t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
