import { useState, useEffect, useCallback } from 'react';
import { Post, getPostsQuery, subscribeToCollection } from '../lib/appService';

export function usePosts(communityId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    const q = getPostsQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setPosts(data as Post[]);
        setLoading(false);
        setError(null);
      },
      'posts'
    );

    return () => unsubscribe();
  }, [communityId, version]);

  return { posts, loading, error, reload };
}
