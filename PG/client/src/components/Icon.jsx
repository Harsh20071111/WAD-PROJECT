import {
  ArrowDownRight, ArrowUpRight, BadgeCheck, BedDouble, Bell, Building2, Wifi,
  CalendarDays, Check, CheckCircle2, ChevronRight, CircleAlert, CircleHelp,
  CircleX, ClipboardList, CreditCard, Eye, EyeOff, FileDown, FileText,
  Grid2X2, HardHat, Home, LayoutDashboard, LifeBuoy, LockKeyhole, LogIn,
  LogOut, Mail, Megaphone, MoreHorizontal, Phone, Plus, ReceiptText,
  Search, Send, Settings2, ShieldCheck, Star, UserPlus, UserRound, Users,
  WalletCards, Wrench, X,
} from 'lucide-react';

const icons = {
  add: Plus, add_circle: Plus, apartment: Building2, arrow_forward: ChevronRight,
  arrow_upward: ArrowUpRight, arrow_downward: ArrowDownRight, badge: BadgeCheck, bed: BedDouble, bolt: ArrowUpRight, build: Wrench, build_circle: Wrench, building: Building2, calendar_month: CalendarDays,
  campaign: Megaphone, check: Check, check_circle: CheckCircle2, chevron_right: ChevronRight,
  close: X, contact_phone: Phone, credit_card: CreditCard, currency_rupee: WalletCards,
  dashboard: LayoutDashboard, domain: Building2, edit: Settings2, engineering: HardHat,
  error: CircleX, file_download: FileDown, grid_view: LayoutDashboard, grid_4x4: Grid2X2,
  groups: Users, how_to_reg: BadgeCheck, hotel: BedDouble, info: CircleHelp,
  login: LogIn, logout: LogOut, lock: LockKeyhole, mail: Mail, menu: MoreHorizontal,
  notifications: Bell, person: UserRound, person_add: UserPlus, receipt_long: ReceiptText,
  reviews: Star, search: Search, send: Send, settings: Settings2, shield: ShieldCheck,
  support_agent: LifeBuoy, task_alt: CheckCircle2, verified_user: ShieldCheck,
  visibility: Eye, visibility_off: EyeOff, warning: CircleAlert, wallet: WalletCards, wifi: Wifi,
  close_small: X, home: Home, assignment: ClipboardList, assignment_late: ClipboardList,
  description: FileText,
};

const Icon = ({ name, size = 20, className = '', strokeWidth = 1.9 }) => {
  const Component = icons[name] || CircleHelp;
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
};

export default Icon;
