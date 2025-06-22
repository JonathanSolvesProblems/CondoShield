import React from "react";
import { Shield, Globe } from "lucide-react";
import { Language } from "../types";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthModal } from "./AuthModal";

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
    { id: "generator", label: t("nav.generator") },
  ];
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));

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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t("app.title")}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {t("app.tagline")}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
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

          {/* Language Toggle */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() =>
                  onLanguageChange(language === "en" ? "fr" : "en")
                }
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  currentPage === item.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAuth(true)}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  );
};
