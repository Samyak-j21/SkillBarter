import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Create Post States
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Expand Post for Comments
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: "" }
  const [commentSubmitting, setCommentSubmitting] = useState({});

  // Active Filter Tag
  const [activeFilter, setActiveFilter] = useState("All");

  const TAGS = ["General", "Success Story", "Skill Request", "Study Group"];

  useEffect(() => {
    const session = localStorage.getItem("user");
    if (!session) {
      navigate("/");
      return;
    }
    setMe(JSON.parse(session));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      } else {
        throw new Error(data.error || "Failed to load posts.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load community feed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isSubmitting || !me) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tag: newTag,
          authorEmail: me.email,
          authorName: me.name
        })
      });

      const newPost = await response.json();
      if (response.ok) {
        setPosts(prev => [newPost, ...prev]);
        setNewTitle("");
        setNewContent("");
        setNewTag("General");
      } else {
        alert(newPost.error || "Failed to submit post.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong creating the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!me) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, email: me.email })
      });

      const updatedPost = await response.json();
      if (response.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Error upvoting post:", err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId] || "";
    if (!text.trim() || commentSubmitting[postId] || !me) return;

    setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          email: me.email,
          authorName: me.name,
          text: text.trim()
        })
      });

      const updatedPost = await response.json();
      if (response.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      } else {
        alert(updatedPost.error || "Failed to add comment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === "All") return true;
    return post.tag === activeFilter;
  });

  const getTagColor = (tag) => {
    switch (tag) {
      case "Success Story": return "bg-green-100/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/20";
      case "Skill Request": return "bg-blue-100/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/20";
      case "Study Group": return "bg-amber-100/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/20";
      default: return "bg-neutral-100/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/20";
    }
  };

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl font-black theme-text-primary tracking-tighter">
            Community Hub
          </h1>
          <p className="text-lg theme-text-secondary mt-3 font-medium">
            Connect, trade stories, announce skill requests, and collaborate with creators.
          </p>

          {/* Filtering Tabs */}
          <div className="mt-8 flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveFilter("All")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                activeFilter === "All"
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "theme-bg-card theme-border theme-text-secondary hover:theme-text-primary"
              }`}
            >
              All Threads
            </button>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeFilter === tag
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10"
                    : "theme-bg-card theme-border theme-text-secondary hover:theme-text-primary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="mb-8 px-6 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-3xl text-red-500 text-sm font-semibold">
            Error: {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* LEFT: Feed listing */}
          <div className="lg:col-span-2 space-y-8">
            {loading ? (
              [1, 2].map(n => (
                <div key={n} className="theme-bg-card rounded-[2.5rem] p-8 border theme-border animate-pulse h-60"></div>
              ))
            ) : (
              <>
                {filteredPosts.map(post => {
                  const hasUpvoted = me && post.likes?.includes(me.email.toLowerCase());
                  const isExpanded = expandedPostId === post.id;
                  
                  return (
                    <article 
                      key={post.id}
                      className="group theme-bg-card rounded-[2.5rem] p-8 border theme-border shadow-sm hover:border-blue-500 hover:shadow-2xl hover:shadow-neutral-200/20 dark:hover:shadow-none transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl flex items-center justify-center font-black text-sm border theme-border shadow-inner">
                            {post.authorName ? post.authorName[0].toUpperCase() : "?"}
                          </div>
                          <div>
                            <span className="font-bold theme-text-primary text-sm leading-tight block">{post.authorName}</span>
                            <span className="text-[9px] theme-text-muted font-bold uppercase tracking-widest mt-1 block">{post.dateStr || "Just now"}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getTagColor(post.tag)}`}>
                          {post.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold theme-text-primary mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="theme-text-secondary text-sm leading-relaxed mb-6 whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Post Actions footer */}
                      <div className="flex items-center gap-4 pt-5 border-t theme-border">
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleUpvote(post.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                            hasUpvoted
                              ? "bg-red-500/10 border-red-500/20 text-red-500"
                              : "theme-bg-page theme-border theme-text-muted hover:theme-text-primary"
                          }`}
                        >
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                          <span>Upvote ({post.likes?.length || 0})</span>
                        </button>

                        {/* Comments Toggle Button */}
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl theme-bg-page border theme-border text-[10px] font-black uppercase tracking-wider theme-text-muted hover:theme-text-primary transition-all"
                        >
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48L4.5 20.25l3.228-.605a9.015 9.015 0 004.272.605z" />
                          </svg>
                          <span>Comments ({post.comments?.length || 0})</span>
                        </button>
                      </div>

                      {/* Expandable Comments Drawer Section */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t theme-border space-y-6 animate-scale-up">
                          <h4 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Comments</h4>
                          
                          {/* Comments List */}
                          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {post.comments && post.comments.length > 0 ? (
                              post.comments.map(cmt => (
                                <div key={cmt.id} className="theme-bg-page/50 p-4 rounded-2xl border theme-border flex gap-3 text-xs">
                                  <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 theme-text-secondary rounded-lg flex items-center justify-center font-bold shrink-0">
                                    {cmt.authorName ? cmt.authorName[0].toUpperCase() : "?"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <span className="font-bold theme-text-primary">{cmt.authorName}</span>
                                      <span className="text-[8px] theme-text-muted uppercase font-black">{cmt.dateStr}</span>
                                    </div>
                                    <p className="theme-text-secondary font-medium leading-relaxed break-words">{cmt.text}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs theme-text-muted font-bold text-center py-4">No comments yet. Start the discussion below!</p>
                            )}
                          </div>

                          {/* Comment Input Form */}
                          <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-3">
                            <input
                              value={commentInputs[post.id] || ""}
                              onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                              placeholder="Write a comment..."
                              required
                              className="flex-1 theme-bg-page border theme-border theme-text-primary px-4 py-3 rounded-xl outline-none focus:border-blue-600 transition-all font-semibold text-xs placeholder:text-neutral-300"
                            />
                            <button
                              type="submit"
                              disabled={commentSubmitting[post.id]}
                              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-neutral-200 transition-colors shrink-0 disabled:opacity-35"
                            >
                              Reply
                            </button>
                          </form>
                        </div>
                      )}
                    </article>
                  );
                })}

                {filteredPosts.length === 0 && (
                  <div className="theme-bg-card rounded-[2.5rem] border theme-border py-20 text-center shadow-sm">
                    <h3 className="text-xl font-bold theme-text-primary">No threads found</h3>
                    <p className="theme-text-muted text-sm mt-2 max-w-xs mx-auto">Be the first to create a post under this category to start exchange threads!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Post Creator Sidebar */}
          <div className="theme-bg-card rounded-[2.5rem] p-8 border theme-border shadow-sm sticky top-28">
            <h3 className="text-lg font-black theme-text-primary mb-2 uppercase tracking-wide">
              Create a Thread
            </h3>
            <p className="text-xs theme-text-muted font-semibold leading-relaxed mb-6">
              Share success barters, ask for specific skills, or organize group study groups.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Thread Category</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full theme-bg-page border theme-border theme-text-primary px-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-xs"
                >
                  {TAGS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Thread Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Completed a trade with Sarah!"
                  required
                  className="w-full theme-bg-page border theme-border theme-text-primary px-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-semibold text-xs placeholder:text-neutral-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Content Details</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What is your thread about? List exchange parameters or guidelines..."
                  rows={6}
                  required
                  className="w-full theme-bg-page border theme-border theme-text-primary px-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium text-xs placeholder:text-neutral-300 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-blue-500/10 mt-2"
              >
                {isSubmitting ? "Posting..." : "Publish Post"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
