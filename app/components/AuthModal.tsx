import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export const AuthModal = ({
  onClose,
  t,
}: {
  onClose: () => void;
  t: (key: string) => string;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [signupMessage, setSignupMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setSignupMessage(`❌ ${error.message}`);
      } else {
        setSignupMessage(
          "✅ Signup successful! Please check your email to confirm your account. Make sure to check your junk or spam folder. Once confirmed, you can log in."
        );
        setMode("login"); // Optional
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setSignupMessage(`❌ ${error.message}`);
      } else {
        onClose();
      }
    }
  };

  const handleOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) alert(error.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
        </h2>
        {signupMessage && (
          <div className="mt-2 text-sm text-center p-2 bg-blue-100 text-blue-800 rounded">
            {signupMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder={t("auth.displayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {mode === "login" ? t("auth.loginButton") : t("auth.signupButton")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleOAuth}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            {t("auth.google")}
          </button>
        </div>

        <div className="mt-4 text-sm text-center">
          {mode === "login" ? (
            <>
              {t("auth.noAccount")}{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600"
              >
                {t("auth.signupLink")}
              </button>
            </>
          ) : (
            <>
              {t("auth.hasAccount")}{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600"
              >
                {t("auth.loginLink")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
