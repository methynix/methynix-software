import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Doll } from "../components/Doll";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export const WhatsNew = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/posts")
      .then((res) => setPosts(res.data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
      <p className="eyebrow mb-5">What's new</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
        Updates from the studio
      </h1>
      <p className="mt-6 text-lg text-dim max-w-2xl leading-relaxed">
        New projects, releases and small news. We post here when there is
        something worth sharing.
      </p>

      <div className="mt-14">
        {loading ? (
          <p className="text-dim">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <Doll className="w-44 h-48" />
            <h2 className="font-display text-2xl font-semibold mt-6">Hey — nothing new yet</h2>
            <p className="text-dim mt-2 max-w-sm">
              The studio has been quiet here. When we ship something or share
              news, it will show up on this page.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post, i) => (
              <article key={post.id} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 border-b border-line pb-12">
                <div className="md:col-span-3">
                  <p className="font-mono text-xs text-faint">
                    {String(posts.length - i).padStart(2, "0")}
                  </p>
                  <p className="text-sm text-dim mt-1">{formatDate(post.created_at)}</p>
                </div>
                <div className="md:col-span-9">
                  {post.image_url ? (
                    <div className="rounded-xl overflow-hidden border border-line mb-5">
                      <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" loading="lazy" />
                    </div>
                  ) : null}
                  <h2 className="font-display text-2xl font-semibold">{post.title}</h2>
                  <p className="text-dim mt-3 leading-relaxed whitespace-pre-line">{post.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
