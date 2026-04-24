import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { useAdmin } from '../hooks/useAdmin';
import type { AdminUser } from '../types/admin';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';


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

const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; color: string }
> = {
  Active: {
    label: 'Active',
    bg: '#91feef',
    color: '#006259',
  },
  Pending: {
    label: 'Pending',
    bg: '#d3e4fe',
    color: '#435368',
  },
  Blocked: {
    label: 'Blocked',
    bg: '#fe8983',
    color: '#752121',
  },
};

const ACTION_CONFIG: Record<
  Status,
  { label: string; color: string; hoverBg: string }
> = {
  Active: {
    label: 'Block',
    color: '#9f403d',
    hoverBg: 'rgba(159, 64, 61, 0.1)',
  },
  Pending: {
    label: 'Approve',
    color: '#006b62',
    hoverBg: 'rgba(0, 107, 98, 0.1)',
  },
  Blocked: {
    label: 'Unblock',
    color: '#545f73',
    hoverBg: 'rgba(84, 95, 115, 0.1)',
  },
};


function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {cfg.label}
    </span>
  );
}

function ActionButton({
  status,
  onClick,
}: {
  status: Status;
  onClick?: () => void;
}) {
  const cfg = ACTION_CONFIG[status];
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 border-none hover:bg-opacity-10"
      style={{
        color: cfg.color,
        backgroundColor: 'transparent'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cfg.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {cfg.label}
    </button>
  );
}

function MemberRow({ member, onUpdateStatus }: { member: Member; onUpdateStatus: (id: string, status: string) => void }) {
  const isBlocked = member.status === 'Blocked';

  return (
    <tr
      className="group hover:bg-surface-container-low transition-colors duration-200"
      style={{
        borderBottom: '1px solid rgba(169, 180, 185, 0.1)'
      }}
    >
      {/* User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {member.avatar ? (
            <img 
              src={member.avatar} 
              alt={member.name} 
              className={`w-8 h-8 rounded-sm object-cover shadow-sm ${isBlocked ? 'grayscale opacity-60' : ''}`}
            />
          ) : (
            <div className={`w-8 h-8 capitalize rounded-sm bg-surface-container-high flex items-center justify-center text-xs font-bold ${isBlocked ? 'opacity-50' : ''}`}>
               {member.name[0]}
            </div>
          )}
          <span className={`text-xs font-bold text-on-surface ${isBlocked ? 'opacity-50' : ''}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {member.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <span className={`text-xs ${isBlocked ? 'opacity-50' : ''}`} style={{ fontFamily: 'Inter, sans-serif' }}>
          {member.email}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={member.status} />
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <span className={`text-xs font-medium uppercase text-on-surface ${isBlocked ? 'opacity-50' : ''}`} style={{ fontFamily: 'Inter, sans-serif' }}>
          {member.role}
        </span>
      </td>

      {/* Action */}
      <td className="px-6 py-4 text-right">
        <ActionButton 
          status={member.status} 
          onClick={() => {
            const nextStatus = member.status === 'Active' ? 'BLOCKED' : 'ACTIVE';
            onUpdateStatus(member.id, nextStatus);
          }}
        />
      </td>
    </tr>
  );
}

function PagerButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 border-none cursor-pointer ${
        active ? 'bg-[#545f73] text-white font-bold' : 'bg-transparent text-[#566166] font-medium hover:bg-surface-container-high'
      }`}
      style={{
        fontFamily: "Inter, sans-serif"
      }}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */
export function Members() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { users, totalCount, isLoading, error, getUsers, updateUserStatus } = useAdmin();

  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    getUsers({ limit: pageSize, offset });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentPage]);

  const normalizedMembers = useMemo(
    () => users.map(mapAdminUserToMember),
    [users]
  );

  const filtered = useMemo(
    () =>
      normalizedMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [normalizedMembers, searchQuery]
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayoutNew>
      <div 
        className="min-h-screen bg-[#f7f9fb]"
        style={{ paddingBottom: '24px' }}
      >
        <div 
          className="max-w-[1280px] mx-auto w-full"
          style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '32px' }}
        >
          {/* ── Header ── */}
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-[#2a3439]" style={{ fontFamily: 'Manrope, sans-serif' }}>Registry Overview</h2>
            <p className="text-lg max-w-2xl text-on-surface-variant mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
               Manage and audit the complete directory of authorized users. High-fidelity archival controls for the modern digital workspace.
            </p>
          </div>

          {/* ── Search & Filter Bar (HTML Style) ── */}
          <div className="bg-surface-container-low rounded-md px-8 py-2 mb-5 flex flex-col md:flex-row items-center gap-4 shadow-sm border-none">
            <div className="flex-1 flex items-center gap-4 w-full">
              <SearchRoundedIcon className="text-outline" />
              <input 
                type="text" 
                placeholder="Search registry by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder-outline-variant font-body outline-none"
                style={{ fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <button className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-full whitespace-nowrap border-none cursor-pointer hover:bg-surface-dim transition-colors">
                Filter by Status
              </button>
              <button className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-full whitespace-nowrap border-none cursor-pointer hover:bg-surface-dim transition-colors">
                Sort: Recent
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2 border border-red-100 text-sm">
              <ErrorRoundedIcon sx={{ fontSize: 18 }} />
              {error}
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-md shadow-sm overflow-hidden relative min-h-[200px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border-surface-container-highest overflow-hidden">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant uppercase border-b-3 border-surface-container-highest text-[11px] tracking-[0.15em] font-bold ">
                    <th className="px-8 py-3">Full Name</th>
                    <th className="px-8 py-3">Email</th>
                    <th className="px-8 py-3">Status</th>
                    <th className="px-8 py-3">Role</th>
                    <th className="px-8 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {filtered.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-outline-variant font-medium">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((member) => (
                      <MemberRow 
                        key={member.id} 
                        member={member} 
                        onUpdateStatus={updateUserStatus}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer (HTML Style) ── */}
            <div className="px-8 py-3 border-t-3 border-surface-container-highest bg-surface-container-low flex justify-between items-center">
              <p className="text-on-surface-variant text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                 Showing {filtered.length} of {totalCount} Identities
              </p>
              <div className="flex items-center gap-3">
                <PagerButton 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
                </PagerButton>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PagerButton 
                        key={page} 
                        active={currentPage === page} 
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PagerButton>
                    );
                  })}
                </div>

                <PagerButton 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
                </PagerButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutNew>
  );
}