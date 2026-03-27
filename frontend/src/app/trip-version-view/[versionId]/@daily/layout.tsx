// @daily/layout.tsx
'use client';

import { ReactNode } from 'react';
// ถ้า read-only ไม่ต้องใช้ provider ก็ลบออกได้เลย
const VersionDailyLayout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default VersionDailyLayout;
