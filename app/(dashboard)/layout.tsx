import NextTopLoader from 'nextjs-toploader';
import Sidebar from '@/components/ui/Sidebar';
import { Flame } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex text-sm font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <NextTopLoader color="#ec4899" showSpinner={false} height={4} speed={400} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {children}
      </div>
    </div>
  );
}
