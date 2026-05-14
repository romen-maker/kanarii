import { useState, useEffect } from 'react';
import { Post, getPostsQuery, subscribeToCollection } from '../lib/appService';

export function usePosts(communityId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    const q = getPostsQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setPosts(data as Post[]);
        setLoading(false);
      },
      'posts'
    );

    return () => unsubscribe();
  }, [communityId]);

  return { posts, loading, error };
}
