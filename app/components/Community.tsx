import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { CommunityPost } from "../types";
import { supabase } from "../lib/supabaseClient";
import { NewPostModal } from "./NewPostModal";
import { PostDetail } from "./PostDetail";

interface CommunityProps {
  t: (key: string) => string;
}
export const Community: React.FC<CommunityProps> = ({ t }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const categories = [
    { id: "all", label: t("community.all"), icon: MessageSquare },
    { id: "warning", label: t("community.warnings"), icon: AlertTriangle },
    { id: "success", label: t("community.success"), icon: CheckCircle },
    { id: "question", label: t("community.questions"), icon: HelpCircle },
    { id: "advice", label: t("community.advice"), icon: Lightbulb },
  ];

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !posts) return setLoading(false);

    // Fetch reply counts for all posts
    const replyCounts = await Promise.all(
      posts.map(async (post) => {
        const { count, error } = await supabase
          .from("post_replies")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        return { postId: post.id, count: error ? 0 : count || 0 };
      })
    );

    // Merge counts back into posts
    const postsWithCounts = posts.map((post) => {
      const match = replyCounts.find((r) => r.postId === post.id);
      return {
        ...post,
        replies: match?.count ?? 0,
      };
    });

    setPosts(postsWithCounts as CommunityPost[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpvote = async (postId: number) => {
    console.log("Upvoting post ID:", postId);

    const { data: updatedPost, error } = await supabase.rpc(
      "increment_upvote_return",
      { post_id: postId }
    );

    console.log("RPC result:", { updatedPost, error });

    if (error || !updatedPost) {
      console.error("Upvote failed", error?.message);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? updatedPost : post))
    );
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      warning: AlertTriangle,
      success: CheckCircle,
      question: HelpCircle,
      advice: Lightbulb,
    };
    return categoryMap[category as keyof typeof categoryMap] || MessageSquare;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      warning: "text-orange-600 bg-orange-100",
      success: "text-green-600 bg-green-100",
      question: "text-blue-600 bg-blue-100",
      advice: "text-purple-600 bg-purple-100",
    };
    return (
      colorMap[category as keyof typeof colorMap] || "text-gray-600 bg-gray-100"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          {t("community.title")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("community.subtitle")}
        </p>
      </div>

      {/* Search and Filter */}
      {!selectedPost && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("community.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              onClick={async () => {
                const { data } = await supabase.auth.getUser();
                if (!data?.user) {
                  alert("You must be signed in to create a post.");
                  return;
                }
                setShowNewPostModal(true);
              }}
            >
              {t("community.newPost")}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t("community.filter")}:
            </span>
            <div className="flex space-x-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {selectedPost ? (
            <PostDetail
              post={posts.find((p) => p.id === selectedPost.id)!}
              onBack={() => setSelectedPost(null)}
              onUpvote={handleUpvote}
              onReplyPosted={fetchPosts}
            />
          ) : (
            <>
              {" "}
              {filteredPosts.map((post) => {
                const CategoryIcon = getCategoryIcon(post.category);
                const preview =
                  post.content.length > 100
                    ? post.content.slice(0, 100) + "..."
                    : post.content;
                const showRegion = !!post.region;
                const showTimestamp = !!post.timestamp;

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${getCategoryColor(
                            post.category
                          )}`}
                        >
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span>by {post.author}</span>
                            {showRegion && <span>•</span>}
                            {showRegion && <span>{post.region}</span>}
                            {showTimestamp && <span>•</span>}
                            {showTimestamp && <span>{post.timestamp}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {preview}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpvote(post.id);
                          }}
                          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {post.upvotes} {t("community.upvotes")}
                          </span>
                        </button>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {post.replies} {t("community.replies")}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          post.category
                        )}`}
                      >
                        {categories.find((c) => c.id === post.category)?.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No posts found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onPostCreated={async () => {
            const { data, error } = await supabase
              .from("community_posts_with_reply_counts")
              .select("*")
              .order("created_at", { ascending: false });

            if (!error && data) setPosts(data as CommunityPost[]);
          }}
        />
      )}
    </div>
  );
};
