import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import {
  LayoutGrid,
  ContactRound,
  Network,
  ReceiptIndianRupee,
  FileClock,
  FileQuestion,
  Logs,
  BadgeIndianRupee,
  FolderClock,
  Settings,
  Cog,
  MonitorCog,
  Shield,
  Palette,
  LayoutTemplate,
  PanelTop,
  DatabaseBackup,
  Atom,
  History,
  Bug,
  CreditCard,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
      { title: 'Transactions', url: '/transactions', icon: ReceiptIndianRupee },
      { title: 'Support', url: '/support', icon: ContactRound },
    ],
  },
  {
    title: 'Reports',
    icon: History,
    items: [
      { title: 'Payment History', url: '/payments', icon: FileClock },
      { title: 'Refund History', url: '/refunds', icon: History},
      { title: 'Settlement History', url: '/settlements', icon: FolderClock },
    ],
  },
  {
    title: 'System',
    icon: Settings,
    items: [
      {
        title: 'Settings',
        icon: Settings,
        items: [
          { title: 'General Settings', url: '/settings/general', icon: Settings },
          { title: 'Form Settings', url: '/settings/form', icon: MonitorCog },
          { title: 'Payment Settings', url: '/settings/payment', icon: BadgeIndianRupee },
          { title: 'Email Settings', url: '/settings/email', icon: Shield },
        ]
      },
      {
        title: 'Master',
        icon: DatabaseBackup,
        items: [
          { title: 'Currencies', url: '/currencies', icon: BadgeIndianRupee },
          { title: 'Countries', url: '/countries', icon: Network },
          { title: 'States', url: '/states', icon: ReceiptIndianRupee },
          { title: 'Gateways', url: '/gateways', icon: CreditCard },
        ],
      },
      {
        title: 'Frontend',
        icon: Palette,
        items: [
          { title: 'Themes', url: '/themes', icon: Palette },
          { title: 'Widgets', url: '/widgets', icon: LayoutTemplate },
          { title: 'Pages', url: '/pages', icon: PanelTop },
        ],
      },
      {
        title: 'Administration',
        icon: Shield,
        items: [
          { title: 'Roles', url: '/roles', icon: Cog },
          { title: 'Permissions', url: '/permissions', icon: Shield },
          { title: 'Users', url: '/users', icon: ContactRound },
        ],
      },
    ],
  },
  {
    title: 'Developer',
    icon: Bug,
    items: [
      { title: 'Database Backup', url: '/backup', icon: DatabaseBackup },
      { title: 'Cache', url: '/cache', icon: Atom },
      { title: 'Error Logs', url: '/logs', icon: Bug },
      { title: 'Activity Logs', url: '/logs', icon: Logs },
    ],
  },
];

const footerNavItems = [
  {
    title: 'Help',
    url: 'support',
    icon: FileQuestion,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavGroups} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}