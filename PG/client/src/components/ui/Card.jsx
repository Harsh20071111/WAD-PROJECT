const Card = ({ as: Component = 'section', className = '', children, ...props }) => <Component className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`} {...props}>{children}</Component>;
export default Card;
