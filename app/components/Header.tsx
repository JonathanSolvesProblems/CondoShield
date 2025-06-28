import React, { useEffect, useState } from "react";
import { Shield, Globe } from "lucide-react";
import { Language } from "../types";
import { supabase } from "../lib/supabaseClient";
import { AuthModal } from "./AuthModal";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: (key: string) => string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onPageChange,
  language,
  onLanguageChange,
  t,
}) => {
  const navItems = [
    { id: "dashboard", label: t("nav.dashboard") },
    { id: "analyzer", label: t("nav.analyzer") },
    { id: "legal", label: t("nav.legal") },
    { id: "community", label: t("nav.community") },
    { id: "costsaving", label: t("nav.costsavings") },
  ];

  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-auto py-4 w-full flex-wrap md:flex-nowrap gap-y-4">
          {/* Left: Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-gray-900">
                {t("app.title")}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {t("app.tagline")}
              </p>
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex flex-1 justify-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Language + Login/Logout */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={async () => {
                const newLang = language === "en" ? "fr" : "en";
                onLanguageChange(newLang);

                const {
                  data: { user },
                  error,
                } = await supabase.auth.getUser();
                if (!error && user) {
                  const { error: dbError } = await supabase
                    .from("user_locations")
                    .upsert(
                      { user_id: user.id, language: newLang },
                      { onConflict: "user_id" }
                    );
                  if (dbError) {
                    console.error("Failed to save language:", dbError.message);
                  }
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.display_name ||
                    user.user_metadata?.name ||
                    user.user_metadata?.email ||
                    "Anonymous"}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  {t("auth.logout")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("auth.loginButton")}
              </button>
            )}
          </div>

          {showAuth && <AuthModal onClose={() => setShowAuth(false)} t={t} />}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-end w-full">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Slide-down Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
