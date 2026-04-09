/**
 * Navigation and UI State Types
 * 
 * Defines types for role-based navigation, responsive design,
 * and UI state management.
 */

import { UserRole } from './auth';
import { EnhancedUser, TenantContext, SchoolContext, BrandingConfig } from './enhanced-auth';

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: NavigationItem[];
  permissions?: string[];
  roles?: UserRole[];
  badge?: BadgeConfig;
  external?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

export interface BadgeConfig {
  text: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  variant: 'solid' | 'outline' | 'soft';
}

export interface NavigationMenu {
  items: NavigationItem[];
  layout: 'sidebar' | 'topbar' | 'mobile';
  branding?: BrandingConfig;
  footer?: NavigationFooter;
}

export interface NavigationFooter {
  items: NavigationItem[];
  showVersion?: boolean;
  showSupport?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

// Navigation Context
export interface NavigationContext {
  user: EnhancedUser;
  tenant: TenantContext;
  school?: SchoolContext;
  permissions: string[];
  currentRoute: string;
  deviceType: DeviceType;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Navigation State
export interface NavigationState {
  currentMenu: NavigationMenu;
  activeRoute: string;
  breadcrumbs: BreadcrumbItem[];
  
  // Mobile state
  isMobileMenuOpen: boolean;
  
  // Responsive state
  screenSize: ScreenSize;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  
  // History
  routeHistory: string[];
  canGoBack: boolean;
  
  // Loading state
  isLoading: boolean;
}

// Route Configuration
export interface RouteConfig {
  path: string;
  component: string;
  permissions?: string[];
  roles?: UserRole[];
  layout?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
}

// Dashboard Types
export interface DashboardContext {
  user: EnhancedUser;
  tenant: TenantContext;
  school?: SchoolContext;
  timeRange: DateRange;
  filters: Record<string, any>;
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// Widget System
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  component: string;
  permissions: string[];
  defaultSize: WidgetSize;
  configurable: boolean;
  refreshInterval?: number;
  data?: any;
}

export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'progress'
  | 'activity'
  | 'notification'
  | 'custom';

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetInstance extends Widget {
  x: number;
  y: number;
  width: number;
  height: number;
  settings?: Record<string, any>;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: number;
}

// Dashboard Configuration
export interface DashboardConfig {
  defaultWidgets: string[];
  layout: DashboardLayoutType;
  customizable: boolean;
  refreshInterval: number;
  maxWidgets?: number;
  allowedWidgetTypes?: WidgetType[];
}

export type DashboardLayoutType = 
  | 'grid-1-column'
  | 'grid-2-column'
  | 'grid-3-column'
  | 'grid-4-column'
  | 'masonry'
  | 'custom';

// Dashboard State
export interface DashboardState {
  layout: DashboardLayoutType;
  widgets: WidgetInstance[];
  isCustomizing: boolean;
  
  // Data state
  isLoading: boolean;
  lastRefresh: number;
  errors: Record<string, string>;
  
  // User customizations
  userLayout?: DashboardLayoutType;
  hiddenWidgets: string[];
  widgetSettings: Record<string, any>;
}

// Role-Specific Dashboard Configurations
export const DASHBOARD_CONFIGS: Record<UserRole, DashboardConfig> = {
  [UserRole.SUPER_ADMIN]: {
    defaultWidgets: ['platform-metrics', 'tenant-overview', 'system-health', 'user-activity'],
    layout: 'grid-3-column',
    customizable: true,
    refreshInterval: 30000,
    maxWidgets: 12,
  },
  
  [UserRole.TENANT_ADMIN]: {
    defaultWidgets: ['tenant-metrics', 'school-overview', 'user-activity', 'billing-summary'],
    layout: 'grid-2-column',
    customizable: true,
    refreshInterval: 60000,
    maxWidgets: 10,
  },
  
  [UserRole.SCHOOL_ADMIN]: {
    defaultWidgets: ['school-metrics', 'class-overview', 'student-activity', 'teacher-summary'],
    layout: 'grid-2-column',
    customizable: true,
    refreshInterval: 60000,
    maxWidgets: 8,
  },
  
  [UserRole.PRINCIPAL]: {
    defaultWidgets: ['school-metrics', 'class-overview', 'student-activity', 'announcements'],
    layout: 'grid-2-column',
    customizable: true,
    refreshInterval: 60000,
    maxWidgets: 8,
  },
  
  [UserRole.TEACHER]: {
    defaultWidgets: ['my-classes', 'student-progress', 'assignments-due', 'attendance-summary'],
    layout: 'grid-2-column',
    customizable: true,
    refreshInterval: 120000,
    maxWidgets: 6,
  },
  
  [UserRole.PARENT]: {
    defaultWidgets: ['children-overview', 'recent-grades', 'attendance-summary', 'announcements'],
    layout: 'grid-1-column',
    customizable: false,
    refreshInterval: 300000,
    maxWidgets: 4,
  },
  
  [UserRole.STUDENT]: {
    defaultWidgets: ['my-grades', 'assignments-due', 'attendance-summary', 'schedule'],
    layout: 'grid-1-column',
    customizable: false,
    refreshInterval: 300000,
    maxWidgets: 4,
  },
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Navigation Menu Configurations
export const NAVIGATION_CONFIGS: Record<UserRole, NavigationItem[]> = {
  [UserRole.SUPER_ADMIN]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: 'building',
      route: '/tenants',
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'users',
      route: '/users',
    },
    {
      id: 'system',
      label: 'System',
      icon: 'settings',
      children: [
        {
          id: 'system-settings',
          label: 'Settings',
          route: '/system/settings',
        },
        {
          id: 'system-logs',
          label: 'Logs',
          route: '/system/logs',
        },
        {
          id: 'system-monitoring',
          label: 'Monitoring',
          route: '/system/monitoring',
        },
      ],
    },
  ],
  
  [UserRole.TENANT_ADMIN]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'schools',
      label: 'Schools',
      icon: 'school',
      route: '/schools',
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'users',
      route: '/users',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'chart',
      route: '/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
    },
  ],
  
  [UserRole.SCHOOL_ADMIN]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'students',
      label: 'Students',
      icon: 'student',
      route: '/students',
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: 'teacher',
      route: '/teachers',
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: 'class',
      route: '/classes',
    },
    {
      id: 'academic',
      label: 'Academic',
      icon: 'book',
      children: [
        {
          id: 'subjects',
          label: 'Subjects',
          route: '/academic/subjects',
        },
        {
          id: 'assessments',
          label: 'Assessments',
          route: '/academic/assessments',
        },
        {
          id: 'grades',
          label: 'Grades',
          route: '/academic/grades',
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'chart',
      route: '/reports',
    },
  ],
  
  [UserRole.PRINCIPAL]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'students',
      label: 'Students',
      icon: 'student',
      route: '/students',
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: 'teacher',
      route: '/teachers',
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: 'class',
      route: '/classes',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'chart',
      route: '/reports',
    },
  ],
  
  [UserRole.TEACHER]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'my-classes',
      label: 'My Classes',
      icon: 'class',
      route: '/classes',
    },
    {
      id: 'students',
      label: 'Students',
      icon: 'student',
      route: '/students',
    },
    {
      id: 'gradebook',
      label: 'Gradebook',
      icon: 'grade',
      route: '/gradebook',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: 'attendance',
      route: '/attendance',
    },
  ],
  
  [UserRole.PARENT]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'children',
      label: 'My Children',
      icon: 'student',
      route: '/children',
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: 'grade',
      route: '/grades',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: 'attendance',
      route: '/attendance',
    },
    {
      id: 'communication',
      label: 'Messages',
      icon: 'message',
      route: '/messages',
    },
  ],
  
  [UserRole.STUDENT]: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'grades',
      label: 'My Grades',
      icon: 'grade',
      route: '/grades',
    },
    {
      id: 'attendance',
      label: 'My Attendance',
      icon: 'attendance',
      route: '/attendance',
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: 'assignment',
      route: '/assignments',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: 'calendar',
      route: '/schedule',
    },
  ],
};