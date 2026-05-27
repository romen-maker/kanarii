import { useFirestoreCollection } from './useFirestoreCollection';
import { Post, getPostsQuery, subscribeToCollection } from '../lib/appService';

export function usePosts(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Post>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getPostsQuery(communityId);
      return subscribeToCollection(
        q,
        (data) => onData(data as Post[]),
        'posts'
      );
    },
    [communityId]
  );

  return { items, posts: items, loading, error, reload };
}

