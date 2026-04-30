import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { inviteUserSchema, type InviteUserFormData } from '../utils/validations';
import { useAdmin } from '../hooks/useAdmin';
import { toast } from 'sonner';
import { CustomModal } from './CustomModal';
import { Input } from './Input';
import { SelectField } from './SelectField';
import { Button } from './Button';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export interface UserInviteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function UserInviteModal({ open, onClose, onSubmitSuccess }: UserInviteModalProps) {
  const { t } = useTranslation();
  const { inviteUser, isActionLoading } = useAdmin();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema(t)),
    defaultValues: {
      email: '',
      role: 'USER',
      status: 'PENDING',
    }
  });

  const onSubmit = async (data: InviteUserFormData) => {
    try {
      const promise = inviteUser(data);
      toast.promise(promise, {
        loading: t('members.inviteUserModal.sending'),
        success: (res: any) => {
          if (res?.Link) {
            navigator.clipboard.writeText(res.Link);
            return t('members.inviteUserModal.successWithLink');
          }
          return t('members.inviteUserModal.success');
        },
        error: (err: any) => err || t('members.inviteUserModal.error'),
      });

      await promise;
      reset();
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch {
      // Error handled by toast
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title={t('members.inviteMember', 'Invite New User')}
      maxWidth="500px"
      width="100%"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1 text-sm" onClick={handleClose} type="button">
            {t('members.inviteUserModal.cancel')}
          </Button>
          <Button 
            className="flex-1" 
            icon={<SendRoundedIcon sx={{ fontSize: 18 }} />} 
            onClick={handleSubmit(onSubmit)}
            type="button"
            btnClass='rounded-lg w-content text-sm'
            disabled={isActionLoading}
          >
            {isActionLoading ? t('members.inviteUserModal.sending') : t('members.inviteUserModal.send')}
          </Button>
        </div>
      }
    >
      <form id="invite-user-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Input */}
        <Input 
          id="email"
          label={t('members.inviteUserModal.emailLabel')}
          type="email"
          placeholder={t('members.inviteUserModal.emailPlaceholder')}
          icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('email')}
          error={errors.email?.message}
          required
        />

        {/* Selectors Grid */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            id="role"
            label={t('members.inviteUserModal.securityRole')}
            options={[
              { label: 'USER', value: 'USER' },
              { label: 'ADMIN', value: 'ADMIN' },
            ]}
            {...register('role')}
          />
          <SelectField
            id="status"
            label={t('members.inviteUserModal.initialStatus')}
            options={[
              { label: 'ACTIVE', value: 'ACTIVE' },
              { label: 'PENDING', value: 'PENDING' },
              { label: 'BLOCKED', value: 'BLOCKED' },
            ]}
            {...register('status')}
          />
        </div>

        {/* Information Box */}
        <div className="bg-surface-container-low/50 p-4 rounded-xl border-[0.5px] border-primary/30 flex gap-3 items-start">
          <InfoRoundedIcon className="text-primary/60 shrink-0" sx={{ fontSize: 20 }} />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('members.inviteUserModal.infoText')}
          </p>
        </div>
      </form>
    </CustomModal>
  );
}
