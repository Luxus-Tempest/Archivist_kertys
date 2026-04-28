import React from 'react';
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
  const { inviteUser, isLoading } = useAdmin();
  
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
        loading: t('sendingInvitation', 'Sending invitation...'),
        success: (res: any) => {
          if (res?.Link) {
            navigator.clipboard.writeText(res.Link);
            return t('invitationSentWithLink', 'Invitation sent! Link copied to clipboard.');
          }
          return t('invitationSent', 'Invitation sent successfully!');
        },
        error: (err: any) => err || t('errorSendingInvitation', 'Error sending invitation'),
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
          <Button variant="outline" className="flex-1" onClick={handleClose} type="button">
            {t('cancel', 'Cancel')}
          </Button>
          <Button 
            className="flex-[2]" 
            icon={<SendRoundedIcon sx={{ fontSize: 18 }} />} 
            onClick={handleSubmit(onSubmit)}
            type="button"
            btnClass='rounded-lg w-content'
            disabled={isLoading}
          >
            {isLoading ? t('sendingInvitation', 'Sending invitation...') : t('sendInvitation', 'Send Invitation')}
          </Button>
        </div>
      }
    >
      <form id="invite-user-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Input */}
        <Input 
          id="email"
          label={t('emailAddress', 'Email Address')}
          type="email"
          placeholder="e.g. name@company.com"
          icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('email')}
          error={errors.email?.message}
          required
        />

        {/* Selectors Grid */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            id="role"
            label={t('securityRole', 'Security Role')}
            options={[
              { label: 'USER', value: 'USER' },
              { label: 'ADMIN', value: 'ADMIN' },
            ]}
            {...register('role')}
          />
          <SelectField
            id="status"
            label={t('initialStatus', 'Initial Status')}
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
            {t('inviteInfoText', 'The invited user will receive an automated secure link via email to complete their profile setup and security authentication.')}
          </p>
        </div>
      </form>
    </CustomModal>
  );
}
