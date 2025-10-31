"use client";

import Taskbar from "../../components/ui/taskbar";

export default function CreatePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold text-primary mb-4">สร้างทริป</h1>
        <p>เนื้อหาหน้า Create...</p>
      </main>
      <Taskbar />
    </div>
  );
}
