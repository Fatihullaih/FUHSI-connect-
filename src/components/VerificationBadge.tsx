import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified?: boolean;
  badgeType?: 'BLUE' | 'GREEN' | 'GOLD' | 'ORANGE' | 'PURPLE' | 'VERIFIED' | 'NONE' | string;
  title?: string;
  showTitle?: boolean;
  className?: string;
  size?: number;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  badgeType = 'BLUE',
  title,
  showTitle = false,
  className = '',
  size = 15,
}) => {
  if (!isVerified) return null;

  const normalizedType = (badgeType || 'BLUE').toUpperCase();

  // Consistent, standardized badge colors across entire platform
  let colorClasses = {
    icon: 'text-sky-500 fill-sky-500 text-white',
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  if (normalizedType === 'GOLD' || normalizedType === 'ORANGE') {
    colorClasses = {
      icon: 'text-amber-500 fill-amber-500 text-white',
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  } else if (normalizedType === 'PURPLE') {
    colorClasses = {
      icon: 'text-purple-500 fill-purple-500 text-white',
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
    };
  }

  const rawTitle = title && title.trim() ? title.trim() : '';
  const isDeclinedOrInternal =
    rawTitle.toLowerCase().includes('decline') ||
    rawTitle.toLowerCase().includes('pending') ||
    rawTitle.toLowerCase().includes('reject');

  const isGenericTitle =
    !rawTitle ||
    isDeclinedOrInternal ||
    ['FUHSI Student', 'Student', 'Verified', 'Verified Student', 'Member'].includes(rawTitle);

  if (showTitle && rawTitle && !isGenericTitle) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${colorClasses.bg} ${className}`}
        title={`Verified Account: ${rawTitle}`}
      >
        <CheckCircle2 size={size} className={`${colorClasses.icon} shrink-0`} />
        <span className="truncate max-w-[120px]">{rawTitle}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center shrink-0 ${className}`}
      title={rawTitle && !isDeclinedOrInternal ? `Verified Account: ${rawTitle}` : 'Verified Account'}
    >
      <CheckCircle2 size={size} className={colorClasses.icon} />
    </span>
  );
};

