import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createUserByAdminSchema, type CreateUserByAdminFormData } from '../utils/validations';
import { useAdmin } from '../hooks/useAdmin';
import { toast } from 'sonner';
import { CustomModal } from './CustomModal';
import { Input } from './Input';
import { SelectField } from './SelectField';
import { Button } from './Button';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function UserCreationModal({ open, onClose, onSubmitSuccess }: ModalProps) {
  const { t } = useTranslation();
  const { createUserByAdmin, isActionLoading } = useAdmin();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserByAdminFormData>({
    resolver: zodResolver(createUserByAdminSchema(t)),
    defaultValues: {
      Email: '',
      FullName: '',
      Password: '',
      Role: 'USER',
      Status: 'PENDING',
    }
  });

  const onSubmit = async (data: CreateUserByAdminFormData) => {
    try {
      const promise = createUserByAdmin(data);
      toast.promise(promise, {
        loading: t('members.createUserModal.creatingUser'),
        success: () => t('members.createUserModal.success'),
        error: (err: any) => err || t('members.createUserModal.error'),
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
      title={t('members.createUserModal.label')}
      maxWidth="500px"
      width="100%"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1 text-sm" onClick={handleClose} type="button">
            {t('members.createUserModal.cancel')}
          </Button>
          <Button 
            className="flex-1" 
            icon={<SendRoundedIcon sx={{ fontSize: 18 }} />} 
            onClick={handleSubmit(onSubmit)}
            type="button"
            btnClass='rounded-lg w-content text-sm'
            disabled={isActionLoading}
          >
            {isActionLoading ? t('members.createUserModal.creatingUser') : t('members.createUserModal.createUser')}
          </Button>
        </div>
      }
    >
      <form id="invite-user-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Input */}
        <Input 
          id="fullName"
          label={t('members.createUserModal.fullName')}
          type="text"
          placeholder={t('members.createUserModal.fullNamePlaceholder')}
          icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('FullName')}
          error={errors.FullName?.message}
          required
        />
        <Input 
          id="email"
          label={t('members.createUserModal.email')}
          type="email"
          placeholder={t('members.createUserModal.emailPlaceholder')}
          icon={<MailRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('Email')}
          error={errors.Email?.message}
          required
        />

        {/* Selectors Grid */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            id="role"
            label={t('members.createUserModal.role')}
            options={[
              { label: 'USER', value: 'USER' },
              { label: 'ADMIN', value: 'ADMIN' },
            ]}
            {...register('Role')}
          />
          <SelectField
            id="status"
            label={t('members.createUserModal.status')}
            options={[
              { label: 'ACTIVE', value: 'ACTIVE' },
              { label: 'PENDING', value: 'PENDING' },
              { label: 'BLOCKED', value: 'BLOCKED' },
            ]}
            {...register('Status')}
          />
        </div>
        <Input 
          id="password"
          label={t('members.createUserModal.password')}
          type="password"
          placeholder={t('members.createUserModal.passwordPlaceholder')}
          icon={<LockRoundedIcon sx={{ fontSize: 18 }} />}
          {...register('Password')}
          error={errors.Password?.message}
          required
        />

        {/* Information Box */}
        <div className="bg-surface-container-low/50 p-4 rounded-xl border-[0.5px] border-primary/30 flex gap-3 items-start">
          <InfoRoundedIcon className="text-primary/60 shrink-0" sx={{ fontSize: 20 }} />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('members.createUserModal.createUserInfoText')}
          </p>
        </div>
      </form>
    </CustomModal>
  );
}
