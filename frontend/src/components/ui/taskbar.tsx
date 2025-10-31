'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Taskbar() {
  const pathname = usePathname();

  const items = [
    { href: '/home', label: 'หน้าหลัก', icon: 'fi fi-rs-home' },
    { href: '/yourtrips', label: 'ทริปทั้งหมด', icon: 'fi fi-rs-map' },
    { href: '/createtrip', label: 'สร้างทริป', icon: 'fi fi-rs-add' },
    { href: '/memory', label: 'ความทรงจำ', icon: 'fi fi-rs-copy-image' },
    { href: '/profile', label: 'โปรไฟล์', icon: 'fi fi-rr-user' },
  ];

  return (
    <div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center py-2">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={`flex flex-col items-center ${
                active ? 'text-[#25CF7A]' : 'text-gray-400'
              }`}
            >
              <i className={`${item.icon} text-xl ${active ? 'text-[#25CF7A]' : ''}`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
