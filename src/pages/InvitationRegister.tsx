import { useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { signupUserSchema, type SignupUserFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation, Trans } from 'react-i18next'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

/** Decode a JWT payload without verifying the signature */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Handle base64url → base64 conversion
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function InvitationRegister() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerInvitedUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get('token') || '';

  // Extract email from the JWT invitation token
  const emailFromToken = useMemo(() => {
    if (!token) return '';
    const payload = decodeJwtPayload(token);
    return payload?.email || '';
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupUserFormData>({
    resolver: zodResolver(signupUserSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      Email: emailFromToken,
    },
  });

  const onSubmit = async (data: SignupUserFormData) => {
    try {
      const payload = {
        FullName: data.FullName,
        Password: data.Password,
      };

      const registerPromise = registerInvitedUser({ data: payload, token });
      toast.promise(registerPromise, {
        loading: t('invitationPage.completingAccount'),
        success: t('invitationPage.completedAccount'),
        error: (err: any) => err || t('invitationPage.errorCompleting'),
      });

      await registerPromise;
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch {
      // Error handled by toast.promise
    }
  };

  return (
    <AuthPageLayout
      title={t('invitationPage.completeRegistration', 'Complete Registration')}
      subtitle={t('invitationPage.fillInYourDetails', 'Fill in your personal details to join the team.')}
      imageAlt={t('signupPage.modernArchitecturalDetailsWithCleanLines')}
      imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAVmvP0nNUNNLIrcGB5yQOTmZepG9Iq80ckhRKYj_ITI7PIvxq1CtZn4_iZb-l1vhI0TFE6yZgREZomjh2L5S-0UyAT6apBw2RVzRc83plgfgl_nqbwFXLI7MuCR1JRoP715RpRUiYE4vqwgl_gYnacAy5GH8XBGbAYq3tuxRrjLpaNzKln8Y5ha9nfrOFG2YpO2J7hTFQ0Y8TBnyYHEwKwxWqdx59zFAy64nZy9JmpuJiRUfqhev2uFnSvnUsUNCkXYi6rJFDaHNo"
      headline={t('invitationPage.welcomeToTheTeam', 'Welcome to the Team.')}
      description={t('invitationPage.youveBeenInvited', "You've been invited to join the organization. Set up your account to get started.")}
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input 
            id="fullName"
            label={t('signupPage.fullName')} 
            type="text" 
            placeholder={t('signupPage.JDoe')} 
            icon={<PersonRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('FullName')}
            error={errors.FullName?.message}
          />

          <Input 
            id="email"
            label={t('signupPage.userEmail')} 
            type="email" 
            placeholder={t('signupPage.userEmailPlaceholder')} 
            icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('Email')}
            error={errors.Email?.message}
            readOnly
            inputClassName='cursor-not-allowed text-on-surface-variant/80'
          />
          
          <Input 
            id="password"
            label={t('signupPage.password')} 
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
        </div>

        <div className="flex items-start gap-1 cursor-pointer group pt-3">
          <div className="relative flex items-center h-4 mt-0.5">
            <input type="checkbox" className="peer sr-only " required id="terms" />
            <div className="w-4 h-4 rounded-[4px] border border-outline-variant/30 bg-surface peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 transition-all flex items-center justify-center peer-checked:[&>svg]:opacity-100">
              <CheckRoundedIcon className="text-on-primary opacity-0 transition-opacity" sx={{ fontSize: 12 }} />
            </div>
          </div>
          <label htmlFor="terms" className="text-xs font-medium text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors cursor-pointer">
            <Trans
              i18nKey="acceptTerms"
              components={{
                terms: (
                  <a
                    href="#"
                    className="text-primary hover:underline underline-offset-2"
                  />
                ),
                privacy: (
                  <a
                    href="#"
                    className="text-primary hover:underline underline-offset-2"
                  />
                )
              }}
            />
          </label>
        </div>

        <div className="pt-3">
          <Button type="submit" variant="solid" icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} disabled={isLoading}>
            {isLoading ? t('invitationPage.completingAccount') : t('invitationPage.completeAccount')}
          </Button>
        </div>
      </form>

      {/* <p className="text-center text-sm text-on-surface-variant">
        {t('signupPage.alreadyHaveAnAccount')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('signupPage.signIn')}</Link>
      </p> */}
    </AuthPageLayout>
  );
}
