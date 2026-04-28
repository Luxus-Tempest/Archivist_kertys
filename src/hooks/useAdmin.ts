import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchUsers, clearAdminError, updateUserStatus, inviteUser as inviteUserThunk, createUserByAdmin as createUserByAdminThunk } from '../store/admin/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, totalCount, offset, limit, isLoading, error } = useSelector((state: RootState) => state.admin);

  const getUsers = async (options: { limit?: number; offset?: number } = {}) => {
    return dispatch(fetchUsers(options)).unwrap();
  };

  const updateStatus = async (userId: string, status: string) => {
    return dispatch(updateUserStatus({ userId, status })).unwrap();
  };

  const inviteUser = async (data: { email: string; role: string; status: string }) => {
    return dispatch(inviteUserThunk(data)).unwrap();
  };

  const createUserByAdmin = async (data: { Email: string; Role: string; Status: string; Password: string; FullName: string }) => {
    return dispatch(createUserByAdminThunk(data)).unwrap();
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
    inviteUser,
    createUserByAdmin,
    clearError: handleClearError
  };
};
