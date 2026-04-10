import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { loginUser, signupUser, logout, clearError, fetchMe } from '../store/auth/authSlice';
import type { LoginFormData, SignupFormData } from '../utils/validations';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const login = async (data: LoginFormData) => {
    return dispatch(loginUser(data)).unwrap();
  };

  const signup = async (data: SignupFormData) => {
    return dispatch(signupUser(data)).unwrap();
  };

  const getProfile = async () => {
    return dispatch(fetchMe()).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login,
    signup,
    getProfile,
    logout: handleLogout,
    clearError: handleClearError
  };
};
