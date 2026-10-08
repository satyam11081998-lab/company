import {
  UserPlus, Users, Building2, Handshake, CheckSquare, Phone, CalendarDays, Package, BookOpen, FileText, ShoppingCart,
  Receipt, Truck, ClipboardList, LifeBuoy, Lightbulb, Megaphone, Boxes, Home, BarChart3, PieChart, LayoutDashboard,
  Target, Send, Bot, ShieldCheck, Settings, History, Trash2, Workflow, Mail, Globe, Filter, Star,
  Gauge, Layers, FileInput, Smile, Activity, Sparkles, Map, KeyRound, Database, TrendingUp, GitBranch, Zap,
} from 'lucide-react';

export const CRM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  UserPlus, Users, Building2, Handshake, CheckSquare, Phone, CalendarDays, Package, BookOpen, FileText, ShoppingCart,
  Receipt, Truck, ClipboardList, LifeBuoy, Lightbulb, Megaphone, Boxes, Home, BarChart3, PieChart, LayoutDashboard,
  Target, Send, Bot, ShieldCheck, Settings, History, Trash2, Workflow, Mail, Globe, Filter, Star,
  Gauge, Layers, FileInput, Smile, Activity, Sparkles, Map, KeyRound, Database, TrendingUp, GitBranch, Zap,
};

export function CrmIcon({ name, className }: { name: string; className?: string }) {
  const I = CRM_ICONS[name] ?? Boxes;
  return <I className={className} />;
}
