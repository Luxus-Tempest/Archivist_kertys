import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { useAdmin } from '../hooks/useAdmin';
import type { AdminUser } from '../types/admin';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { GroupButton } from '../components/GroupButton';
import { UserInviteModal } from '../components/UserInviteModal';
import { UserCreationModal } from '../components/UserCreationModal';
import { useTranslation } from 'react-i18next';


type Status = 'Active' | 'Pending' | 'Blocked';

interface Member {
  id: string;
  name: string;
  email: string;
  status: Status;
  role: string;
  avatar?: string;
}

const mapAdminUserToMember = (user: AdminUser): Member => {
  const statusMap: Record<string, Status> = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'BLOCKED': 'Blocked'
  };
  const roleMap: Record<string, string> = {
    'ADMIN': 'Admin',
    'USER': 'User'
  };
  return {
    id: user.id,
    name: user.fullname,
    email: user.email,
    status: statusMap[user.status] || 'Pending',
    role: roleMap[user.role] || user.role,
    avatar: user.avatar
  };
};

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  Active:  { label: 'Active',   bg: '#91feef', color: '#006259' },
  Pending: { label: 'Pending',  bg: '#d3e4fe', color: '#435368' },
  Blocked: { label: 'Blocked',  bg: '#fe8983', color: '#752121' },
};

const ACTION_CONFIG: Record<Status, { label: string; color: string; hoverBg: string; borderColor: string }> = {
  Active:  { label: 'Block',    color: '#9f403d', hoverBg: 'rgba(159,64,61,0.08)',  borderColor: 'rgba(159,64,61,0.25)' },
  Pending: { label: 'Approve',  color: '#006b62', hoverBg: 'rgba(0,107,98,0.08)',   borderColor: 'rgba(0,107,98,0.25)'  },
  Blocked: { label: 'Unblock',  color: '#545f73', hoverBg: 'rgba(84,95,115,0.08)', borderColor: 'rgba(84,95,115,0.25)' },
};

// ─── Avatar colour palette (deterministic by initial) ───────────────────────
const AVATAR_PALETTES = [
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#fef9c3', color: '#a16207' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#ffedd5', color: '#c2410c' },
];

function getAvatarPalette(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

// ─── StatusBadge — UNCHANGED ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: 'Inter, sans-serif' }}
    >
      {cfg.label}
    </span>
  );
}

// ─── ActionButton — bordered ghost style ─────────────────────────────────────
function ActionButton({ status, onClick }: { status: Status; onClick?: () => void }) {
  const cfg = ACTION_CONFIG[status];
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 border"
      style={{
        color: cfg.color,
        backgroundColor: hovered ? cfg.hoverBg : 'transparent',
        borderColor: hovered ? cfg.borderColor : 'transparent',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </button>
  );
}

// ─── MemberRow ────────────────────────────────────────────────────────────────
function MemberRow({ member, onUpdateStatus }: { member: Member; onUpdateStatus: (id: string, status: string) => void }) {
  const isBlocked = member.status === 'Blocked';
  const palette   = getAvatarPalette(member.name);

  return (
    <tr
      className="group transition-colors duration-150 hover:bg-[#f0f4f8]"
      style={{ borderBottom: '1px solid #eaecef' }}
    >
      {/* User */}
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-8 h-8 rounded-md object-cover ring-2 ring-white shadow-sm"
              style={{ opacity: isBlocked ? 0.45 : 1, filter: isBlocked ? 'grayscale(1)' : 'none' }}
            />
          ) : (
            <div
              className="w-8 h-8 bg-surface-container-low rounded-md flex items-center justify-center text-xs font-bold uppercase ring-2 ring-white shadow-sm flex-shrink-0"
              // style={{
              //   backgroundColor: isBlocked ? '#e5e7eb' : palette.bg,
              //   color:           isBlocked ? '#9ca3af' : palette.color,
              // }}
            >
              {member.name[0]}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span
              className="text-[13px] font-semibold text-[#1e2a32] leading-tight truncate"
              style={{ opacity: isBlocked ? 0.45 : 1, fontFamily: 'Inter, sans-serif' }}
            >
              {member.name}
            </span>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-3.5">
        <span
          className="text-[12.5px] text-[#4b5563] truncate"
          style={{ opacity: isBlocked ? 0.45 : 1, fontFamily: 'Inter, sans-serif' }}
        >
          {member.email}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-3.5">
        <StatusBadge status={member.status} />
      </td>

      {/* Role */}
      <td className="px-6 py-3.5">
        <span
          className="text-[11px] font-bold tracking-wider uppercase"
          style={{
            color: isBlocked ? '#9ca3af' : '#6b7280',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {member.role}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-3.5">
        <div className="flex justify-end">
          <ActionButton
            status={member.status}
            onClick={() => {
              const nextStatus = member.status === 'Active' ? 'BLOCKED' : 'ACTIVE';
              onUpdateStatus(member.id, nextStatus);
            }}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── PagerButton ──────────────────────────────────────────────────────────────
function PagerButton({ children, active, disabled, onClick }: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] transition-all duration-150 border select-none ${
        active
          ? 'bg-[#2a3439] text-white font-bold border-[#2a3439] shadow-sm'
          : disabled
          ? 'bg-transparent text-[#c4cdd4] border-transparent cursor-not-allowed'
          : 'bg-transparent text-[#566166] border-transparent hover:bg-[#e9edf0] hover:border-[#dde2e6] font-medium cursor-pointer'
      }`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {children}
    </button>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #eaecef' }}>
      {[160, 220, 80, 60, 60].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-3 rounded-full animate-pulse bg-[#eaecef]"
            style={{ width: w, marginLeft: i === 4 ? 'auto' : 0 }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Column header helper ─────────────────────────────────────────────────────
function Th({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-6 py-3 text-[10.5px] font-bold tracking-[0.12em] uppercase text-[#8b95a1] whitespace-nowrap ${right ? 'text-right' : 'text-start'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {children}
    </th>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Members() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery]         = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [isInviteModalOpen, setIsInviteModalOpen]     = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const pageSize = 10;

  const { users, totalCount, isLoading, error, getUsers, updateUserStatus } = useAdmin();

  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    getUsers({ limit: pageSize, offset });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const normalizedMembers = useMemo(() => users.map(mapAdminUserToMember), [users]);

  const filtered = useMemo(
    () => normalizedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [normalizedMembers, searchQuery]
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  // Smart page window: always show up to 5 pages around the current one
  const pageWindow = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let p = left; p <= right; p++) range.push(p);
    return range;
  }, [currentPage, totalPages]);

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem   = Math.min(currentPage * pageSize, totalCount);

  return (
    <DashboardLayoutNew>
      <div className="min-h-screen  pb-10">
        <div className="max-w-[1280px] mx-auto w-full px-6 pt-8">

          {/* ── Header ── */}
          <div className="mb-8">
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1e2a32] mb-1"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t('members.title')}
            </h2>
            <p className="text-sm text-[#6b7280] max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('members.subtitle')}
            </p>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-5">
            {/* Search bar */}
            <div className="flex-1 flex items-center gap-3 bg-white border border-outline-variant/40 shadow-card rounded-lg px-4 py-2.5 ">
              <SearchRoundedIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t('members.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] py-1 text-[#1e2a32] placeholder-[#c4cdd4]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#9ca3af] hover:text-[#6b7280] text-xs font-medium transition-colors cursor-pointer border-none bg-transparent"
                >
                  {t('members.clear')}
                </button>
              )}
            </div>

            {/* Filter pills */}
            {/* <div className="flex items-center gap-2">
              <button className="px-3.5 py-2 bg-white border border-[#e2e6ea] text-[#4b5563] text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer hover:bg-[#f0f4f8] hover:border-[#d1d5db] transition-all duration-150 shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                Filter by Status
              </button>
              <button className="px-3.5 py-2 bg-white border border-[#e2e6ea] text-[#4b5563] text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer hover:bg-[#f0f4f8] hover:border-[#d1d5db] transition-all duration-150 shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sort: Recent
              </button>
            </div> */}

            {/* Actions */}
            <GroupButton
              variant="solid"
              options={[
                { label: t('members.groupButtons.createUser'), value: 'create', onClick: () => setIsCreateUserModalOpen(true) },
                { label: t('members.groupButtons.inviteMember'), value: 'invite', onClick: () => setIsInviteModalOpen(true) },
              ]}
              onMainClick={(option) => {
                if (option.value === 'invite') setIsInviteModalOpen(true);
                if (option.value === 'create') setIsCreateUserModalOpen(true);
              }}
            />

            <UserInviteModal open={isInviteModalOpen}    onClose={() => setIsInviteModalOpen(false)} />
            <UserCreationModal open={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} />
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <ErrorRoundedIcon sx={{ fontSize: 16 }} />
              {error}
            </div>
          )}

          {/* ── Table card ── */}
          <div className="bg-white rounded-xl border border-outline-variant/40 shadow-card overflow-hidden">

            {/* table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#eaecef] bg-[#f9fafb]">
                    <Th >{t('members.table.user')}</Th>
                    <Th>{t('members.table.email')}</Th>
                    <Th>{t('members.table.status')}</Th>
                    <Th>{t('members.table.role')}</Th>
                    <Th right>{t('members.table.actions')}</Th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-[#9ca3af] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {t('members.noMembersFound')}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((member) => (
                      <MemberRow key={member.id} member={member} onUpdateStatus={updateUserStatus} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            <div className="px-6 py-3 border-t border-[#eaecef] bg-[#f9fafb] flex justify-between items-center">
              <p className="text-[12px] text-[#8b95a1] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {totalCount === 0
                  ? 'No results'
                  : `Showing ${startItem}–${endItem} of ${totalCount} users`}
              </p>

              <div className="flex items-center gap-1">
                <PagerButton
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                </PagerButton>

                {pageWindow[0] > 1 && (
                  <>
                    <PagerButton onClick={() => setCurrentPage(1)}>1</PagerButton>
                    {pageWindow[0] > 2 && <span className="text-[#c4cdd4] text-xs px-1">…</span>}
                  </>
                )}

                {pageWindow.map(page => (
                  <PagerButton key={page} active={currentPage === page} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PagerButton>
                ))}

                {pageWindow[pageWindow.length - 1] < totalPages && (
                  <>
                    {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                      <span className="text-[#c4cdd4] text-xs px-1">…</span>
                    )}
                    <PagerButton onClick={() => setCurrentPage(totalPages)}>{totalPages}</PagerButton>
                  </>
                )}

                <PagerButton
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                </PagerButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayoutNew>
  );
}