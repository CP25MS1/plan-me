'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/style-utils';
import { normalizePath } from '@/lib/string';

import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { href: '/home', label: 'navbar.home', icon: 'fi fi-rs-home' },
  { href: '/trip/all', label: 'navbar.trips', icon: 'fi fi-rs-map' },
  { href: '/trip/create', label: 'navbar.create', icon: 'fi fi-rs-add', hideOnPage: true },
  { href: '/memory', label: 'navbar.memories', icon: 'fi fi-rs-copy-image' },
  { href: '/profile', label: 'navbar.profile', icon: 'fi fi-rr-user' },
] as const;

const HREFS = NAV_ITEMS.map((item) => item.href);
type MainHref = (typeof HREFS)[number];

const activate = (
  items: typeof NAV_ITEMS,
  href: MainHref[],
  options: { negate: boolean } = { negate: false }
) => {
  return items.map((item) => ({
    hideOnPage: false,
    ...item,
    disabled: options.negate ? href.includes(item.href) : !href.includes(item.href),
  }));
};

const Navbar = ({
  items = activate(NAV_ITEMS, ['/home', '/profile', '/trip/create']),
  className = '',
  listClassName = 'flex justify-around items-center py-2',
  itemClass = 'flex flex-col items-center text-xs',
  activeClass = 'text-primary',
}) => {
  const { t } = useTranslation('common');
  const pathname = usePathname() ?? '/';
  const current = normalizePath(pathname) as MainHref;
  const currentItem = items.find((i) => i.href === current);

  return (
    HREFS.includes(current) &&
    !currentItem?.hideOnPage && (
      <nav
        aria-label="Primary navigation"
        className={cn('w-full bg-white border-t shadow-md', className)}
      >
        <ul className={listClassName}>
          {items.map(({ href, label, icon, disabled }) => {
            const active = normalizePath(href) === current;
            return (
              <li key={href}>
                <Link
                  href={href as any}
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
                  <span className="mt-1">{t(label)}</span>
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
