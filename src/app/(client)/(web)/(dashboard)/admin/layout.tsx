"use client";

import Sidebar from "./(components)/Sidebar";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#070708] text-white">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
