import { useState, useEffect } from 'react';
import { Post, getPostsQuery, subscribeToCollection } from '../lib/appService';

export function usePosts(communityId: string = 'arteara') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
