'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/style-utils';
import { normalizePath } from '@/lib/string';
import { tokens } from '@/providers/theme/design-tokens';

import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { href: '/home', label: 'navbar.home', icon: 'fi fi-rs-home' },
  { href: '/search', label: 'navbar.search', icon: 'fi fi-rr-search' },
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
  items = activate(NAV_ITEMS, ['/home', '/profile', '/trip/create', '/search', '/memory']),
  className = '',
  listClassName = 'flex items-center justify-between gap-1 px-3 py-2',
  itemClass = 'group relative inline-flex min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out',
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
        className={cn(
          'fixed bottom-0 left-0 z-50 w-full border-t border-black/5 shadow-[0_-10px_30px_rgba(22,127,75,0.14)]',
          className
        )}
        style={{ backgroundColor: tokens.color.primary }}
      >
        <ul className={listClassName}>
          {items.map(({ href, label, icon, disabled }) => {
            const active = normalizePath(href) === current;

            return (
              <li key={href} className="flex flex-1 justify-center">
                <Link
                  href={href}
                  onClick={disabled || current === href ? (e) => e.preventDefault() : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    itemClass,
                    active
                      ? '-translate-y-1 scale-105 text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-0 -z-10 rounded-xl bg-linear-to-b from-white/30 to-white/20 backdrop-blur-lg ring-1 ring-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out',
                      active
                        ? 'scale-100 opacity-100'
                        : 'scale-75 opacity-0 group-hover:scale-95 group-hover:opacity-60'
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-0.5 left-1/2 h-1 w-[60%] -translate-x-1/2 rounded-full bg-white/60 transition-all duration-300 ease-out',
                      active ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:opacity-50'
                    )}
                  />
                  <i
                    className={cn(
                      icon,
                      'text-xl leading-none text-white transition-transform duration-300 ease-out',
                      active ? 'scale-110' : 'scale-100'
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      'whitespace-nowrap text-[11px] leading-none text-white transition-all duration-300 ease-out',
                      active ? 'opacity-100' : 'opacity-90'
                    )}
                  >
                    {t(label)}
                  </span>
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
