import React, { useState } from "react";
import { ThumbsUp, MessageSquare, ArrowLeft } from "lucide-react";
import { CommunityPost } from "../types";

interface PostDetailProps {
  post: CommunityPost;
  onBack: () => void;
  onUpvote: (id: number) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onUpvote,
}) => {
  const [reply, setReply] = useState("");

  const handleReplySubmit = () => {
    alert(`Reply submitted: ${reply}`);
    setReply("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border">
      <button
        onClick={onBack}
        className="flex items-center mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>

      <div className="text-gray-500 text-sm mb-4 space-x-2">
        <span>by {post.author}</span>
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
          {post.upvotes} Upvotes
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Reply</h3>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder="Write a reply..."
        />
        <button
          onClick={handleReplySubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
