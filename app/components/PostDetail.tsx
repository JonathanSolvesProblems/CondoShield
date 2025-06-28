import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { CommunityPost } from "../types";

interface PostDetailProps {
  post: CommunityPost;
  onBack: () => void;
  onUpvote: (id: number) => void;
  onReplyPosted: () => void;
  t: (key: string) => string;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onUpvote,
  onReplyPosted,
  t,
}) => {
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchReplies = async () => {
      const { data, error } = await supabase
        .from("post_replies")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false }); // latest first

      if (!error) setReplies(data);
    };

    fetchReplies();
  }, [post.id]);

  const handleReplySubmit = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("You must be logged in to reply.");

    const authorName = isAnonymous
      ? "Anonymous"
      : user.user_metadata.display_name || user.email;

    const { error } = await supabase.from("post_replies").insert({
      post_id: post.id,
      user_id: user.id,
      author: authorName,
      content: reply,
    });

    if (error) return alert(error.message);

    // Optionally increment reply count on post
    await supabase
      .from("community_posts")
      .update({ replies: post.replies + 1 })
      .eq("id", post.id);

    setReplies([
      {
        author: authorName,
        content: reply,
        created_at: new Date().toISOString(),
      },
      ...replies,
    ]);
    setReply("");
    onReplyPosted();

    await supabase.from("user_activity_logs").insert({
      user_id: user.id,
      type: "community",
      title: `Replied to post: ${post.title}`,
      description: `Posted a reply${isAnonymous ? " anonymously" : ""} in ${
        post.region
      } under ${post.category}`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border">
      <button
        onClick={onBack}
        className="flex items-center mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {t("postDetail.back")}
      </button>

      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>

      <div className="text-gray-500 text-sm mb-4 space-x-2">
        <span>
          {t("postDetail.by")} {post.author}
        </span>{" "}
        {post.region && <span>•</span>}
        <span>{post.region}</span>
        {post.timestamp && <span>•</span>}
        <span>{post.timestamp}</span>
      </div>

      <p className="text-gray-800 mb-6">{post.content}</p>

      <div className="flex items-center space-x-4 mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={() => onUpvote(post.id)}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          {post.upvotes} {t("postDetail.upvotes")}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">
          {t("postDetail.reply.title")}
        </h3>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder={t("postDetail.reply.placeholder")}
        />

        {/* Anonymous Toggle */}
        <div className="flex items-center space-x-2 mb-2">
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`flex items-center px-3 py-1 rounded-full text-sm transition ${
              isAnonymous
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isAnonymous
              ? t("postDetail.reply.anonymousOn")
              : t("postDetail.reply.anonymousOff")}
          </button>
        </div>
        <button
          onClick={handleReplySubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t("postDetail.reply.submit")}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">
          {t("postDetail.replies.title")}
        </h3>
        {replies.length === 0 && (
          <p className="text-gray-500">{t("postDetail.replies.empty")}</p>
        )}
        {replies.map((r, index) => (
          <div key={index} className="border-t pt-3 mt-3">
            <p className="text-sm text-gray-500">
              <strong>{r.author}</strong> •{" "}
              {new Date(r.created_at).toLocaleString()}
            </p>
            <p className="text-gray-700">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
