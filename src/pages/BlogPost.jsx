import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'https://kreatixtech.fly.dev';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/${slug}`);
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      navigate('/blog');
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

  if (!post) return null;

  return (
    <div className="min-h-screen bg-offwhite pt-24 pb-16">
      <SEO
        title={post.title}
        description={post.excerpt}
        pathname={`/blog/${post.slug}`}
      />

      <article className="max-w-3xl mx-auto px-6">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-orange hover:text-orange-deep mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs font-medium text-orange bg-orange-50 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-ink mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-grey mb-8 pb-8 border-b border-border">
          <span className="font-medium text-ink">{post.author}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="prose prose-lg max-w-none text-ink-dark leading-relaxed">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
