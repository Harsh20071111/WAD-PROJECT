import Icon from './Icon';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-surface-container',
  iconColor = 'text-primary',
  trend,
  trendLabel,
  children,
  className = '',
}) => {
  return (
    <div className={`stat-card flex flex-col justify-between ${className}`}>
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            {title}
          </span>
          {icon && (
            <span className={`${iconBg} ${iconColor} p-1.5 rounded-lg`}>
              <Icon name={icon} size={20} />
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
            {value}
          </span>
          {trend && (
            <span className={`font-label-sm text-label-sm font-semibold px-1.5 py-0.5 rounded
              ${trend === 'up' ? 'bg-primary-fixed/60 text-primary' :
                trend === 'down' ? 'bg-error-container text-on-error-container' :
                'bg-surface-container text-on-surface-variant'}`}>
              {trendLabel}
            </span>
          )}
        </div>
      </div>
      {subtitle && (
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-space-sm">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-space-sm">{children}</div>}
    </div>
  );
};

export default StatCard;
