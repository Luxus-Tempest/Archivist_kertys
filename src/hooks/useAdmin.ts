import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchUsers, clearAdminError, updateUserStatus } from '../store/admin/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, totalCount, offset, limit, isLoading, error } = useSelector((state: RootState) => state.admin);

  const getUsers = async (options: { limit?: number; offset?: number } = {}) => {
    return dispatch(fetchUsers(options)).unwrap();
  };

  const updateStatus = async (userId: string, status: string) => {
    return dispatch(updateUserStatus({ userId, status })).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearAdminError());
  };

  return {
    users,
    totalCount,
    offset,
    limit,
    isLoading,
    error,
    getUsers,
    updateUserStatus: updateStatus,
    clearError: handleClearError
  };
};
