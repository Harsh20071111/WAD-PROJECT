import Icon from '../Icon';
const EmptyState = ({ icon = 'inbox', title, description, action }) => <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><Icon name={icon} size={32} className="mb-3 text-slate-400" /><h3 className="font-headline text-headline-md">{title}</h3>{description && <p className="mt-1 max-w-sm text-body-sm text-on-surface-variant">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>;
export default EmptyState;
