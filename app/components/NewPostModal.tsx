import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { UserCheck, UserX } from "lucide-react";
import { logUserActivity } from "../lib/activityLogger";

export const NewPostModal = ({
  onClose,
  onPostCreated,
  t,
}: {
  onClose: () => void;
  onPostCreated: () => void;
  t: (key: string) => string;
}) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    region: "",
    category: "warning",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);

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

    if (!user) return alert(`${t("newPostModal.error.notLoggedIn")}`);

    const { error } = await supabase.from("community_posts").insert({
      ...form,
      user_id: user.id,
      author: isAnonymous
        ? "Anonymous"
        : user.user_metadata?.display_name || "Anonymous",
      upvotes: 0,
      replies: 0,
    });

    if (error) return alert(error.message);

    await logUserActivity({
      userId: user.id,
      type: "community",
      title: form.title,
      description: `Created a new post ${isAnonymous ? "anonymously" : ""} in ${
        form.region
      } under ${form.category}`,
    });

    onPostCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">{t("newPostModal.title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder={t("newPostModal.placeholder.title")}
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <textarea
            name="content"
            placeholder={t("newPostModal.placeholder.content")}
            value={form.content}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="region"
            placeholder={t("newPostModal.placeholder.region")}
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
            <option value="warning">
              {t("newPostModal.category.warning")}
            </option>
            <option value="success">
              {" "}
              {t("newPostModal.category.success")}
            </option>
            <option value="question">
              {" "}
              {t("newPostModal.category.question")}
            </option>
            <option value="advice"> {t("newPostModal.category.advice")}</option>
          </select>

          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center px-3 py-1 rounded-full text-sm transition ${
                isAnonymous
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isAnonymous ? (
                <UserX className="w-4 h-4 mr-1" />
              ) : (
                <UserCheck className="w-4 h-4 mr-1" />
              )}
              {isAnonymous
                ? `${t("newPostModal.anonymous.postingAnonymous")}`
                : `${t("newPostModal.anonymous.postingNamed")}`}
            </button>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              {t("newPostModal.button.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t("newPostModal.button.post")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
