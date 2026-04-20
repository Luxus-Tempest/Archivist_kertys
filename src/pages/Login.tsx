import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { loginSchema, type LoginFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation, Trans } from 'react-i18next'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    toast.promise(login(data), {
      loading: t('signingIn', 'Signing in...'),
      success: () => {
        navigate('/process-new');
        return t('successfullySignedIn', 'Successfully signed in.');
      },
      error: (err: any) => err || t('incorrectEmailOrPassword', 'Incorrect email or password.'),
    });
  };

  return (
    <AuthPageLayout
      title={t('signIn', 'Sign In')}
      subtitle={t('welcomeBackEnterYourCredentialsToAccessYourLibrary', 'Welcome back. Enter your credentials to access your library.')}
      imageAlt={t('modernMinimalistArchitecturalDetails', 'Modern minimalist architectural details')}
      imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAVmvP0nNUNNLIrcGB5yQOTmZepG9Iq80ckhRKYj_ITI7PIvxq1CtZn4_iZb-l1vhI0TFE6yZgREZomjh2L5S-0UyAT6apBw2RVzRc83plgfgl_nqbwFXLI7MuCR1JRoP715RpRUiYE4vqwgl_gYnacAy5GH8XBGbAYq3tuxRrjLpaNzKln8Y5ha9nfrOFG2YpO2J7hTFQ0Y8TBnyYHEwKwxWqdx59zFAy64nZy9JmpuJiRUfqhev2uFnSvnUsUNCkXYi6rJFDaHNo"
      headline={<><Trans i18nKey="preservingTheBrfutureOfDocumentation">Preserving the <br/>Future of Documentation.</Trans></>}
      description={t('experienceTheQuietAuthorityOfSecureHighendDocumentManagementDesignedForProfessionals', 'Experience the quiet authority of secure, high-end document management designed for professionals.')}
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <Input 
            id="email"
            label="Email" 
            type="email" 
            placeholder="name@test.com" 
            icon="mail"
            {...register('Email')}
            error={errors.Email?.message}
          />
          
          <Input 
            id="password"
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••" 
            icon="lock"
            {...register('Password')}
            error={errors.Password?.message}
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-outline hover:text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            }
          />

          <div className="flex justify-end ml-1 -mt-2">
            <a href="#" className="text-xs font-medium text-primary hover:underline transition-all">
              {t('forgotPassword', 'Forgot password?')}
            </a>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="solid" icon="arrow_forward" disabled={isLoading}>
            {isLoading ? t('authenticating', 'Authenticating...') : t('authenticate', 'Authenticate')}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-on-surface-variant pt-4">
        {t('newToDocme', 'New to DocMe?')} <Link to="/signup" className="text-primary font-semibold hover:underline">{t('createAnDocmeAccount', 'Create an DocMe account')}</Link>
      </p>
    </AuthPageLayout>
  );
}
