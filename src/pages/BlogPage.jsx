import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pt-24 pb-16">
      <SEO
        title="Blog"
        description="Insights on software development, cybersecurity, cloud architecture, and technology trends from Kreatix Technologies."
        keywords="tech blog, cybersecurity blog, software development, cloud architecture, IT insights"
        pathname="/blog"
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-ink mb-3">Blog</h1>
          <p className="text-grey text-lg max-w-2xl">
            Insights on software development, cybersecurity, cloud architecture, and technology trends.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <p className="text-grey">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                {post.coverImage && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags?.map(tag => (
                      <span key={tag} className="text-xs font-medium text-orange bg-orange-50 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-ink mb-2 leading-tight">
                    <Link to={`/blog/${post.slug}`} className="hover:text-orange transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-grey-dark mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-grey">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-orange font-medium">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
