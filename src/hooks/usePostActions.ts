import { useEntityActions } from './useEntityActions';
import { createPost, updatePost, deletePost, createRespuesta } from '../lib/appService';

export function usePostActions() {
  const { perform, isExecuting } = useEntityActions();

  const addPost = async (payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(createPost(payload), options);
  };

  const editPost = async (id: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(updatePost(id, payload), options);
  };

  const removePost = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deletePost(id), options);
  };

  const addRespuesta = async (postId: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(createRespuesta(postId, payload), options);
  };

  return {
    addPost,
    editPost,
    removePost,
    addRespuesta,
    isExecuting
  };
}
