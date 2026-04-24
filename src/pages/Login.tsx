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
import { useTranslation } from 'react-i18next'
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
  });

//   useEffect(() => {
//   trigger();
// }, [i18n.language, trigger]);

  const onSubmit = async (data: LoginFormData) => {
    toast.promise(login(data), {
      loading: t('signingIn', 'Signing in...'),
      success: () => {
        navigate('/process');
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
      headline={t('preservingTheBrfutureOfDocumentation', 'Preserving the <br/>Future of Documentation.')}
      description={t('experienceTheQuietAuthorityOfSecureHighendDocumentManagementDesignedForProfessionals', 'Experience the quiet authority of secure, high-end document management designed for professionals.')}
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input 
            id="email"
            label={t('email')} 
            type="email" 
            placeholder={t('nameAtCompanyCom')} 
            icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('Email')}
            error={errors.Email?.message}
          />
          
          <Input 
            id="password"
            label={t('password')} 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••" 
            icon={<LockRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('Password')}
            error={errors.Password?.message}
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-outline hover:text-on-surface-variant transition-colors flex items-center justify-center p-1"
              >
                {showPassword ? (
                  <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                )}
              </button>
            }
          />

          <div className="flex justify-end ml-1 -mt-2">
            <a href="#" className="text-xs font-medium text-primary hover:underline transition-all">
              {t('forgotPassword')}
            </a>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="solid" icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} disabled={isLoading}>
            {isLoading ? t('authenticating') : t('authenticate')}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-on-surface-variant pt-4">
        {t('newToDocme')} <Link to="/signup" className="text-primary font-semibold hover:underline">{t('createAnDocmeAccount')}</Link>
      </p>
    </AuthPageLayout>
  );
}
