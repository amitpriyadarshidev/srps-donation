import { LinkProps } from '@tanstack/react-router';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

/** User & Team types */
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/** Base navigation type */
interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: LucideIcon | null;
}

/** Sidebar-style items */
export type NavLink = BaseNavItem & {
  url: LinkProps['to'];
  items?: never;
}

export type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[];
  url?: never;
}

export type NavItem = NavLink | NavCollapsible;

export interface NavGroup {
  title?: string;
  icon?: LucideIcon | null;
  url?: string;
  items?: NavItem[];
}

/** Layout shared types */
export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  ziggy: Config & { location: string };
  sidebarOpen: boolean;
  [key: string]: unknown;
}
