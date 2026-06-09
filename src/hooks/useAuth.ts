import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, signupUser, createOrganization, registerInvitedUser as registerInvitedUserThunk, logout, clearError, fetchMe, forgotPassword, resetPassword } from '../store/auth/authSlice';
import type { LoginFormData, SignupFormData, ForgotPasswordFormData } from '../utils/validations';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error } = useAppSelector((state) => state.auth);

  const login = async (data: LoginFormData) => {
    return dispatch(loginUser(data)).unwrap();
  };

  const signup = async (data: SignupFormData) => {
    return dispatch(signupUser(data)).unwrap();
  };

  const requestForgotPassword = async (data: ForgotPasswordFormData) => {
    return dispatch(forgotPassword(data)).unwrap();
  };

  const handleResetPassword = async (data: { token: string; newPassword: string }) => {
    return dispatch(resetPassword(data)).unwrap();
  };

  const registerOrganization = async (data: any) => {
    return dispatch(createOrganization(data)).unwrap();
  };

  const handleRegisterInvitedUser = async (data: any) => {
    return dispatch(registerInvitedUserThunk(data)).unwrap();
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
    forgotPassword: requestForgotPassword,
    resetPassword: handleResetPassword,
    createOrganization: registerOrganization,
    registerInvitedUser: handleRegisterInvitedUser,
    getProfile,
    logout: handleLogout,
    clearError: handleClearError
  };
};
