import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface ISidebar {
  children?: ReactNode;
}

interface ISidebarMenuItem {
  children?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface ISidebarMenu {
  children?: ReactNode;
}

interface ISidebarContent {
  children?: ReactNode;
}

const SidebarContent = ({ children }: ISidebarContent) => {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-4 p-4'>
      {children}
    </div>
  );
};

const SidebarMenu = ({ children }: ISidebarMenu) => {
  return <div className='divide-y border-y border-base-300'>{children}</div>;
};

const SidebarMenuItem = ({ active, onClick, children }: ISidebarMenuItem) => {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-4 px-6 py-4 transition-all duration-300 hover:bg-base-300',
        {
          'bg-base-300': active,
        }
      )}
      onClick={onClick}>
      {children}
    </div>
  );
};

export const Sidebar = ({ children }: ISidebar) => {
  return (
    <div className='h-full w-full bg-base-200 py-6 drop-shadow-md'>
      {children}
    </div>
  );
};

Sidebar.Content = SidebarContent;
Sidebar.Menu = SidebarMenu;
Sidebar.MenuItem = SidebarMenuItem;
