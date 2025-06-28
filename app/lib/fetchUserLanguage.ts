import { supabase } from "./supabaseClient";

export const fetchUserLanguageNote = async (): Promise<string> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return "Please respond in English.";

  const { data, error } = await supabase
    .from("user_locations")
    .select("language")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    console.warn("Failed to fetch user language, defaulting to English.");
    return "Please respond in English.";
  }

  return data.language === "fr"
    ? "Please respond in French."
    : "Please respond in English.";
};

export const formatLanguageForPrompt = (langKey: string): string => {
  return langKey === "fr"
    ? "Please respond in French."
    : "Please respond in English.";
};