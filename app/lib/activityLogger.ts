import { supabase } from "./supabaseClient";

export async function logUserActivity({
  userId,
  type,
  title,
  description,
}: {
  userId: string;
  type: string;
  title: string;
  description?: string;
}) {
  if (!userId) {
    console.error("logUserActivity: userId is required");
    return;
  }

  const { error } = await supabase.from("user_activity_logs").insert([
    {
      user_id: userId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error logging user activity:", error);
  }
}
