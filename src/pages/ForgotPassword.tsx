import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation } from 'react-i18next';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export function ForgotPassword() {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  const [showOrgId, setShowOrgId] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema(t)),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const payload = {
      ...data,
      OrganizationId: showOrgId ? data.OrganizationId : undefined,
    };

    try {
      await forgotPassword(payload);
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err || t('forgotPasswordPage.resetRequestError', 'An error occurred while requesting password reset.'));
    }
  };

  const handleToggleOrg = () => {
    setShowOrgId((prev) => {
      const next = !prev;
      if (!next) {
        setValue('OrganizationId', '');
      }
      return next;
    });
  };

  if (isSuccess) {
    return (
      <AuthPageLayout
        title={t('forgotPasswordPage.successTitle', 'Vérifiez votre boîte mail')}
        subtitle={t('forgotPasswordPage.successSubtitle', 'Un lien de réinitialisation vous a été envoyé.')}
        displayLeftImage={false}
      >
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-2">
            <MailRoundedIcon sx={{ fontSize: 32 }} />
          </div>
          <p className="text-on-surface-variant font-body text-sm max-w-sm mx-auto leading-relaxed">
            {t('forgotPasswordPage.checkMailInstructions', 'Veuillez consulter vos e-mails. Nous y avons envoyé un lien pour vous permettre de configurer un nouveau mot de passe.')}
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              {t('forgotPasswordPage.backToLogin', 'Back to login')}
            </Link>
          </div>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title={t('forgotPasswordPage.title', 'Forgot Password')}
      subtitle={t('forgotPasswordPage.subtitle', 'Enter your email address to receive a reset link.')}
      displayLeftImage={false}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="email"
          label={t('forgotPasswordPage.emailLabel', 'Email Address')}
          type="email"
          placeholder={t('forgotPasswordPage.emailPlaceholder', 'name@company.com')}
          icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('Email')}
          error={errors.Email?.message}
        />

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/50 border border-outline-variant/10">
          <div className="flex flex-col mr-4">
            <span className="text-sm font-semibold text-on-surface">
              {t('forgotPasswordPage.specifyOrgToggle', 'Plusieurs comptes avec cet email ?')}
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">
              {t('forgotPasswordPage.specifyOrgToggleDesc', 'Préciser l\'identifiant de l\'organisation')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleOrg}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showOrgId ? 'bg-blue-medium' : 'bg-outline-variant/50'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-md ring-0 transition duration-200 ease-in-out ${
                showOrgId ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {showOrgId && (
          <Input
            id="organizationId"
            label={t('forgotPasswordPage.orgIdLabel', 'Identifiant de l\'organisation')}
            type="text"
            placeholder={t('forgotPasswordPage.orgIdPlaceholder', 'Ex: org_123')}
            icon={<CorporateFareRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('OrganizationId')}
            error={errors.OrganizationId?.message}
          />
        )}

        <div className="w-full pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-outline hover:text-on-surface-variant transition-colors flex items-center gap-1 order-2 sm:order-1"
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            {t('forgotPasswordPage.backToLogin', 'Back to login')}
          </Link>
          <Button
            type="submit"
            variant="solid"
            className="w-full sm:w-auto order-1 sm:order-2"
            icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            disabled={isLoading}
          >
            {isLoading ? t('forgotPasswordPage.sending', 'Sending...') : t('forgotPasswordPage.sendButton', 'Send Reset Link')}
          </Button>
        </div>
      </form>
    </AuthPageLayout>
  );
}
