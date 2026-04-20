import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { signupSchema, type SignupFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation, Trans } from 'react-i18next'

export function Signup() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const signupPromise = signup(data);
      toast.promise(signupPromise, {
        loading: t('creatingAccount', 'Creating account...'),
        success: t('accountCreatedSuccessfully', 'Account created successfully.'),
        error: (err: any) => err || t('errorCreatingAccount', 'Error creating account.'),
      });
      
      await signupPromise;
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch {
      // Error handled by toast.promise
    }
  };

  return (
    <AuthPageLayout
      title={t('createAccount', 'Create Account')}
      subtitle={t('joinDocmeToStartManagingYourDocumentsWithEditorialPrecision', 'Join DocMe to start managing your documents with editorial precision.')}
      imageAlt={t('modernArchitecturalDetailsWithCleanLines', 'Modern architectural details with clean lines')}
      imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAVmvP0nNUNNLIrcGB5yQOTmZepG9Iq80ckhRKYj_ITI7PIvxq1CtZn4_iZb-l1vhI0TFE6yZgREZomjh2L5S-0UyAT6apBw2RVzRc83plgfgl_nqbwFXLI7MuCR1JRoP715RpRUiYE4vqwgl_gYnacAy5GH8XBGbAYq3tuxRrjLpaNzKln8Y5ha9nfrOFG2YpO2J7hTFQ0Y8TBnyYHEwKwxWqdx59zFAy64nZy9JmpuJiRUfqhev2uFnSvnUsUNCkXYi6rJFDaHNo"
      headline={<><Trans i18nKey="theQuietAuthorityBrofSecureDesign">The Quiet Authority <br/>of Secure Design.</Trans></>}
      description={t('experienceTheFutureOfProfessionalDocumentManagementMinimalistSecureAndBuiltForExcellence', 'Experience the future of professional document management. Minimalist, secure, and built for excellence.')}
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <Input 
            id="fullName"
            label={t('fullName', 'Full Name')} 
            type="text" 
            placeholder={t('jeanDupont', 'Jean Dupont')} 
            icon="person"
            {...register('FullName')}
            error={errors.FullName?.message}
          />

          <Input 
            id="email"
            label={t('workEmail', 'Work Email')} 
            type="email" 
            placeholder="name@company.com" 
            icon="mail"
            {...register('Email')}
            error={errors.Email?.message}
          />
          
          <Input 
            id="password"
            label={t('password', 'Password')} 
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
        </div>

        <div className="flex items-start gap-3 cursor-pointer group pt-2">
          <div className="relative flex items-center h-4 mt-0.5">
            <input type="checkbox" className="peer sr-only" required id="terms" />
            <div className="w-4 h-4 rounded-[4px] border border-outline-variant/30 bg-surface peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 transition-all flex items-center justify-center peer-checked:[&>span]:opacity-100">
              <span className="material-symbols-outlined text-on-primary text-[10px] opacity-0 transition-opacity font-bold">check</span>
            </div>
          </div>
          <label htmlFor="terms" className="text-xs font-medium text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors cursor-pointer"><Trans i18nKey="iAcceptTheAHrefClassnametextprimaryHoverunderlineUnderlineoffset2termsOfServiceaAndAHrefClassnametextprimaryHoverunderlineUnderlineoffset2privacyPolicya">I accept the <a href="#" className="text-primary hover:underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-primary hover:underline underline-offset-2">Privacy Policy</a>.</Trans></label>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="solid" icon="arrow_forward" disabled={isLoading}>
            {isLoading ? t('creatingAccount2', 'Creating Account...') : t('createAccount', 'Create Account')}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-on-surface-variant pt-4">
        {t('alreadyHaveAnAccount', 'Already have an account?')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('signIn', 'Sign In')}</Link>
      </p>
    </AuthPageLayout>
  );
}
