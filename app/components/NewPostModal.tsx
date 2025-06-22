import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const NewPostModal = ({
  onClose,
  onPostCreated,
}: {
  onClose: () => void;
  onPostCreated: () => void;
}) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    region: "",
    category: "warning",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) return alert("You must be logged in to post.");

    const { error } = await supabase.from("community_posts").insert({
      ...form,
      user_id: user.id,
      author: user.user_metadata?.display_name || "Anonymous",
      upvotes: 0,
      replies: 0,
    });

    if (error) return alert(error.message);
    onPostCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <textarea
            name="content"
            placeholder="Content"
            value={form.content}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="region"
            placeholder="Region (e.g., Miami, FL)"
            value={form.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="question">Question</option>
            <option value="advice">Advice</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
