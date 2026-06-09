import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { resetPasswordSchema, type ResetPasswordFormData } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { AuthPageLayout } from '../components/layout/AuthPageLayout';
import { useTranslation } from 'react-i18next';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const { resetPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    formState: { errors },
    register,
    handleSubmit,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema(t)),
    mode: 'onChange',
  });

  const passwordValue = watch('Password');
  const confirmPasswordValue = watch('ConfirmPassword');

  // Activer le bouton de soumission uniquement si les deux mots de passe correspondent et ne sont pas vides
  const isFormValid =
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue &&
    passwordValue.length >= 4;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error(t('resetPasswordPage.missingToken', 'Le jeton de réinitialisation est manquant.'));
      return;
    }

    try {
      await resetPassword({ token, newPassword: data.Password });
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err || t('resetPasswordPage.resetError', 'Une erreur est survenue lors de la réinitialisation du mot de passe.'));
    }
  };

  if (isSuccess) {
    return (
      <AuthPageLayout
        title={t('resetPasswordPage.successTitle', 'Mot de passe modifié')}
        subtitle={t('resetPasswordPage.successSubtitle', 'Votre mot de passe a été réinitialisé avec succès.')}
        displayLeftImage={false}
      >
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-2">
            <CheckCircleRoundedIcon className='text-blue-medium' sx={{ fontSize: 32 }} />
          </div>
          <p className="text-on-surface-variant font-body text-sm max-w-sm mx-auto leading-relaxed">
            {t('resetPasswordPage.successInstructions', 'Vous pouvez maintenant vous connecter à votre compte avec votre nouveau mot de passe.')}
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="px-5 py-2 bg-blue-medium text-on-primary rounded-xl font-semibold hover:bg-blue-dark transition-colors inline-flex items-center gap-1.5"
            >
              {t('resetPasswordPage.goToLogin', 'Se connecter')}
            </Link>
          </div>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title={t('resetPasswordPage.title', 'Nouveau mot de passe')}
      subtitle={t('resetPasswordPage.subtitle', 'Veuillez saisir votre nouveau mot de passe.')}
      displayLeftImage={false}
    >
      {!token ? (
        <div className="p-4 rounded-xl bg-error/10 text-error text-center font-medium text-sm">
          {t('resetPasswordPage.invalidLink', 'Ce lien de réinitialisation est invalide ou expiré.')}
          <div className="mt-4">
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t('resetPasswordPage.backToLogin', 'Retour à la connexion')}
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="password"
            label={t('resetPasswordPage.passwordLabel', 'Nouveau mot de passe')}
            type="password"
            placeholder="••••••••"
            icon={<LockRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('Password')}
            error={errors.Password?.message}
          />

          <Input
            id="confirmPassword"
            label={t('resetPasswordPage.confirmPasswordLabel', 'Confirmer le mot de passe')}
            type="password"
            placeholder="••••••••"
            icon={<LockRoundedIcon sx={{ fontSize: 18 }} />}
            {...register('ConfirmPassword')}
            error={errors.ConfirmPassword?.message}
          />

          <div className="w-full pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-outline hover:text-on-surface-variant transition-colors flex items-center gap-1 order-2 sm:order-1"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              {t('resetPasswordPage.cancel', 'Annuler')}
            </Link>
            <Button
              type="submit"
              variant="solid"
              className="w-full sm:w-auto order-1 sm:order-2"
              icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? t('resetPasswordPage.resetting', 'Réinitialisation...') : t('resetPasswordPage.submitButton', 'Réinitialiser')}
            </Button>
          </div>
        </form>
      )}
    </AuthPageLayout>
  );
}
