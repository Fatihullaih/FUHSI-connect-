import React from 'react';
import { CheckCircle, ShieldCheck, Crown, Star } from 'lucide-react';
import { BadgeType } from '../types';

interface VerificationBadgeProps {
  badgeType: BadgeType;
  title?: string;
  showTitle?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  badgeType,
  title,
  showTitle = false,
}) => {
  if (!badgeType || badgeType === 'NONE') return null;

  let colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
  let icon = <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white shrink-0" />;

  switch (badgeType.toUpperCase()) {
    case 'GREEN':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 text-white shrink-0" />;
      break;
    case 'PURPLE':
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
      icon = <Crown className="w-3.5 h-3.5 text-purple-600 fill-purple-600 text-white shrink-0" />;
      break;
    case 'GOLD':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 text-white shrink-0" />;
      break;
    case 'BLUE':
    default:
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      icon = <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white shrink-0" />;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {icon}
      {showTitle && title && <span>{title}</span>}
    </span>
  );
};
