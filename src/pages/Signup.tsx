import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { signupSchema, signupOrgSchema, type SignupFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation, Trans } from 'react-i18next'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export function Signup() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const { createOrganization, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema(t)),
    mode: 'onTouched',
  });

  //  useEffect(() => {
  //    trigger();
  //  }, [i18n.language, trigger]);

  const handleContinue = async () => {
    // Validate only step 1 fields
    const orgValues = {
      OrgName: getValues('OrgName'),
      OrgEmail: getValues('OrgEmail'),
      Domain: getValues('Domain'),
    };

    const result = signupOrgSchema(t).safeParse(orgValues);
    if (!result.success) {
      // Trigger validation on step 1 fields to show errors
      await trigger(['OrgName', 'OrgEmail', 'Domain']);
      return;
    }

    setDirection('forward');
    setStep(2);
  };

  const handleBack = () => {
    setDirection('backward');
    setStep(1);
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const payload = {
        orgName: data.OrgName,
        orgDomain: data.Domain,
        orgEmail: data.OrgEmail,
        adminEmail: data.Email,
        adminFullName: data.FullName,
        adminPassword: data.Password
      };

      const signupPromise = createOrganization(payload);
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

  const stepTitle = step === 1
    ? t('signupPage.organizationDetails')
    : t('signupPage.createAccount');

  const stepSubtitle = step === 1
    ? t('signupPage.enterYourOrganizationInfo')
    : t('signupPage.joinDocPulseAI');

  return (
    <AuthPageLayout
      title={stepTitle}
      subtitle={stepSubtitle}
      imageAlt={t('signupPage.modernArchitecturalDetailsWithCleanLines')}
      imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAVmvP0nNUNNLIrcGB5yQOTmZepG9Iq80ckhRKYj_ITI7PIvxq1CtZn4_iZb-l1vhI0TFE6yZgREZomjh2L5S-0UyAT6apBw2RVzRc83plgfgl_nqbwFXLI7MuCR1JRoP715RpRUiYE4vqwgl_gYnacAy5GH8XBGbAYq3tuxRrjLpaNzKln8Y5ha9nfrOFG2YpO2J7hTFQ0Y8TBnyYHEwKwxWqdx59zFAy64nZy9JmpuJiRUfqhev2uFnSvnUsUNCkXYi6rJFDaHNo"
      headline={t('signupPage.theQuietAuthorityBrofSecureDesign')}
      description={t('signupPage.experienceTheFutureOfProfessionalDocumentManagementMinimalistSecureAndBuiltForExcellence')}
      stepIndicator={
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-outline-variant">
            {t('signupPage.stepOf', { current: step, total: 2 })}
          </span>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-outline-variant/30'
              }`} />
            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-outline-variant/30'
              }`} />
          </div>
        </div>
      }
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative ">
          {/* Step 1: Organization Details */}
          <div
            className={`transition-all duration-300 ease-in-out ${step === 1
                ? 'opacity-100 translate-x-0 relative'
                : direction === 'forward'
                  ? 'opacity-0 -translate-x-10 absolute inset-0'
                  : 'opacity-0 translate-x-10 absolute inset-0'
              }`}
            style={{ pointerEvents: step === 1 ? 'auto' : 'none' }}
          >
            <div className="space-y-4">
              <Input
                id="orgName"
                label={t('signupPage.organizationName')}
                type="text"
                placeholder={t('signupPage.egArchivistGlobal')}
                icon={<ApartmentRoundedIcon sx={{ fontSize: 18 }} />}
                {...register('OrgName')}
                error={errors.OrgName?.message}
              />

              <Input
                id="orgEmail"
                label={t('signupPage.orgEmail')}
                type="email"
                placeholder={t('signupPage.orgEmailPlaceholder')}
                icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
                {...register('OrgEmail')}
                error={errors.OrgEmail?.message}
              />

              <Input
                id="domain"
                label={t('signupPage.domain')}
                type="text"
                placeholder={t('signupPage.egMycompanyCom')}
                icon={<LanguageRoundedIcon sx={{ fontSize: 18 }} />}
                {...register('Domain')}
                error={errors.Domain?.message}
              />
            </div>

            <div className="pt-4">
              <Button type="button" variant="solid" icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} onClick={handleContinue}>
                {t('signupPage.continueToAccount')}
              </Button>
            </div>
          </div>

          {/* Step 2: User Account Details */}
          <div
            className={`transition-all duration-300 ease-in-out ${step === 2
                ? 'opacity-100 translate-x-0 relative'
                : direction === 'forward'
                  ? 'opacity-0 translate-x-8 absolute inset-0'
                  : 'opacity-0 -translate-x-8 absolute inset-0'
              }`}
            style={{ pointerEvents: step === 2 ? 'auto' : 'none' }}
          >
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

            <div className="flex justify-between pt-3 space-y-2">
              <Button type="button" btnClass="w-max text-md px-4 border-none" variant="outline" icon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="left" onClick={handleBack}>
                {t('back', 'Back')}
              </Button>
              <Button type="submit" btnClass="w-max text-md px-4 " variant="solid" icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} disabled={isLoading}>
                {isLoading ? t('signupPage.creatingAccount2') : t('signupPage.createAccount')}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        {t('signupPage.alreadyHaveAnAccount')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('signupPage.signIn')}</Link>
      </p>
    </AuthPageLayout>
  );
}
