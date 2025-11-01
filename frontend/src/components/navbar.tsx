'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/style-utils';
import { normalizePath } from '@/lib/string';

const NAV_ITEMS = [
  { href: '/home', label: 'หน้าหลัก', icon: 'fi fi-rs-home' },
  { href: '/trip/all', label: 'ทริปทั้งหมด', icon: 'fi fi-rs-map' },
  { href: '/trip/create', label: 'สร้างทริป', icon: 'fi fi-rs-add' },
  { href: '/memory', label: 'ความทรงจำ', icon: 'fi fi-rs-copy-image' },
  { href: '/profile', label: 'โปรไฟล์', icon: 'fi fi-rr-user' },
] as const;

const HREFS = NAV_ITEMS.map((item) => item.href);

const activate = (
  items: typeof NAV_ITEMS,
  href: string[],
  options: { negate: boolean } = { negate: false }
) => {
  return items.map((item) => ({
    ...item,
    disabled: options.negate ? href.includes(item.href) : !href.includes(item.href),
  }));
};

const Navbar = ({
  items = activate(NAV_ITEMS, ['/home']),
  className = '',
  listClassName = 'flex justify-around items-center py-2',
  itemClass = 'flex flex-col items-center text-xs',
  activeClass = 'text-primary',
}) => {
  const pathname = usePathname();
  const current = normalizePath(pathname) as (typeof HREFS)[number];

  return (
    HREFS.includes(current) && (
      <nav
        aria-label="Primary navigation"
        className={cn('w-full bg-white border-t shadow-md', className)}
      >
        <ul role="list" className={listClassName}>
          {items.map(({ href, label, icon, disabled }) => {
            const active = normalizePath(href) === current;
            return (
              <li key={href}>
                <Link
                  // @ts-expect-error href can be Route type
                  href={href}
                  onClick={disabled || current === href ? (e) => e.preventDefault() : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    itemClass,
                    active ? activeClass : 'text-gray-400',
                    'focus-visible:ring-2 focus-visible:ring-offset-2'
                  )}
                >
                  <i
                    className={cn(icon, 'text-xl', active ? activeClass : '')}
                    aria-hidden="true"
                  />
                  <span className="mt-1">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    )
  );
};

export default Navbar;
