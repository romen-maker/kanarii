import { useEntityActions } from './useEntityActions';
import { 
  createCommunityMember, 
  updateCommunityMember, 
  deleteCommunityMember,
  CommunityMember
} from '../lib/appService';

export function useMemberActions() {
  const { perform, isExecuting } = useEntityActions();

  const addMember = async (payload: Partial<CommunityMember>, options?: Parameters<typeof perform>[1]) => {
    return perform(createCommunityMember(payload), options);
  };

  const updateMember = async (memberId: string, cambios: Partial<CommunityMember>, options?: Parameters<typeof perform>[1]) => {
    return perform(updateCommunityMember(memberId, cambios), options);
  };

  const removeMember = async (memberId: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteCommunityMember(memberId), options);
  };

  return {
    addMember,
    updateMember,
    removeMember,
    isExecuting
  };
}
