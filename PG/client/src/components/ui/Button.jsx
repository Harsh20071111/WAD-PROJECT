import Icon from '../Icon';

const Button = ({ variant = 'primary', loading = false, icon, children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-primary',
    secondary: 'bg-white text-on-surface border border-outline-variant hover:bg-surface-container-low focus-visible:ring-primary',
    ghost: 'text-on-surface-variant hover:bg-surface-container-low focus-visible:ring-primary',
    danger: 'bg-error text-on-error hover:bg-[#991b1b] focus-visible:ring-error',
  };
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-label-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : icon && <Icon name={icon} size={17} />}{children}</button>;
};

export default Button;
