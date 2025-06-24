"use client";

import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { AssessmentAnalyzer } from "./components/AssessmentAnalyzer";
import { LegalAssistant } from "./components/LegalAssistant";
import { Community } from "./components/Community";
import { CostSavingSuggestionGenerator } from "./components/CostSavingSuggestionGenerator";
import { useTranslation } from "./hooks/useLanguage";
import {
  Language,
  Assessment,
  DisputeLetter,
  AssessmentItem,
  CommunityPost,
  CostSavingSuggestion,
} from "./types";
import { supabase } from "./lib/supabaseClient";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [language, setLanguage] = useState<Language>("en");
  const { t } = useTranslation(language);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [disputes, setDisputes] = useState<DisputeLetter[]>([]);
  const [userActivityLogs, setUserActivityLogs] = useState<any[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<AssessmentItem[] | null>(
    null
  );
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsMap, setSuggestionsMap] = useState<
    Record<string, CostSavingSuggestion[]>
  >({});
  const [selectedSavingAssessmentId, setSelectedSavingAssessmentId] =
    useState<string>("");

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      if (selectedAssessment) return; // If user selected an assessment, skip fetching latest

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("assessment_analyses")
        .select("results")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to load latest analysis:", error.message);
        return;
      }

      if (data?.results) {
        setLatestAnalysis(data.results);
      }
    };

    const loadData = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessment_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (!assessmentsError && assessmentsData) {
        // Your existing mapping logic
        const mapped = assessmentsData.map((d) => {
          const breakdown = d.results ?? [];
          const amount = breakdown.reduce(
            (sum: number, item: any) => sum + (item.amount || 0),
            0
          );
          return {
            ...d,
            breakdown,
            amount,
            dateReceived: d.updated_at,
          } as Assessment;
        });
        setAssessments(mapped);
      }

      // Fetch disputes
      const { data: disputesData } = await supabase
        .from("dispute_letters")
        .select("*")
        .eq("status", "active")
        .eq("user_id", user.id);
      setDisputes(disputesData ?? []);

      // Fetch user activity logs
      const { data: activityData, error: activityError } = await supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(10); // limit for performance, adjust as needed

      if (activityError) {
        console.error("Failed to fetch user activity logs:", activityError);
      } else {
        setUserActivityLogs(activityData ?? []);
      }
    };

    loadData();
    fetchLatestAnalysis();
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data: suggestions, error } = await supabase
        .from("cost_saving_suggestions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to fetch cost saving suggestions:", error);
        return;
      }

      // Group suggestions by assessment_id
      const map: Record<string, CostSavingSuggestion[]> = {};
      suggestions?.forEach((s) => {
        if (!map[s.assessment_id]) {
          map[s.assessment_id] = [];
        }
        map[s.assessment_id].push(s);
      });

      setSuggestionsMap(map);
    };

    fetchSuggestions();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !postsData) {
      setLoading(false);
      return;
    }

    // Fetch reply counts for all posts
    const replyCounts = await Promise.all(
      postsData.map(async (post) => {
        const { count, error } = await supabase
          .from("post_replies")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        return { postId: post.id, count: error ? 0 : count || 0 };
      })
    );

    // Merge counts into posts
    const postsWithCounts = postsData.map((post) => {
      const match = replyCounts.find((r) => r.postId === post.id);
      return {
        ...post,
        replies: match?.count ?? 0,
      };
    });

    setPosts(postsWithCounts as CommunityPost[]);
    setLoading(false);
  };

  // Upvote handler to pass down
  const handleUpvote = async (postId: number) => {
    const { data: updatedPost, error } = await supabase.rpc(
      "increment_upvote_return",
      { post_id: postId }
    );

    if (error || !updatedPost) {
      console.error("Upvote failed", error?.message);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? updatedPost : post))
    );
  };

  const totalSavings = Object.values(suggestionsMap)
    .flat()
    .reduce((sum, s) => sum + (s.estimated_savings || 0), 0);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            t={t}
            assessments={assessments}
            setAssessments={setAssessments}
            onAssessmentSelect={(assessment) => {
              setSelectedAssessment(assessment);
              setCurrentPage("analyzer");
            }}
            disputes={disputes}
            setDisputes={setDisputes}
            userActivityLogs={userActivityLogs}
            savedAmount={totalSavings}
            suggestionsMap={suggestionsMap}
            onViewSavings={(assessment) => {
              setSelectedSavingAssessmentId(assessment.id);
              setCurrentPage("costsaving");
            }}
          />
        );
      case "analyzer":
        return (
          <AssessmentAnalyzer
            selectedAssessment={
              selectedAssessment ??
              (latestAnalysis
                ? ({ breakdown: latestAnalysis } as Assessment)
                : null)
            }
            t={t}
          />
        );
      case "legal":
        return <LegalAssistant t={t} />;
      case "community":
        return (
          <Community
            t={t}
            posts={posts}
            onUpvote={handleUpvote}
            refreshPosts={fetchPosts}
          />
        );
      case "costsaving":
        return (
          <CostSavingSuggestionGenerator
            t={t}
            assessments={assessments}
            previousSuggestions={suggestionsMap}
            initialSelectedId={selectedSavingAssessmentId}
          />
        );
      default:
        <Dashboard
          t={t}
          assessments={assessments}
          setAssessments={setAssessments}
          onAssessmentSelect={(assessment) => {
            setSelectedAssessment(assessment);
            setCurrentPage("analyzer");
          }}
          disputes={disputes}
          setDisputes={setDisputes}
          userActivityLogs={userActivityLogs}
          savedAmount={totalSavings}
          suggestionsMap={suggestionsMap}
          onViewSavings={(assessment) => {
            setSelectedSavingAssessmentId(assessment.id);
            setCurrentPage("costsaving");
          }}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          if (page !== "analyzer") setSelectedAssessment(null); // clear if navigating away
        }}
        language={language}
        onLanguageChange={setLanguage}
        t={t}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
