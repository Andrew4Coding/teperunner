import { Loader } from "lucide-react";
import { Outlet, useNavigation } from "react-router";
import { ThemeProvider } from "~/components/context/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { ThemeToggler } from "~/components/ui/ThemeToggler";

export async function loader() {
  return null;
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none transition-opacity animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-full p-6 shadow-lg flex items-center justify-center">
            <Loader className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>
      )}
      <div className="p-4 w-full h-full max-h-screen overflow-hidden space-y-2">
        <div className="w-full flex justify-end">
          <ThemeToggler />
        </div>
        {children}
      </div>
      <Toaster />
    </>
  );
}

export default function PageLayout() {
  return (
    <ThemeProvider>
      <MainLayout>
        <main className="h-screen overflow-hidden font-tiktok">
          <Outlet />
        </main>
      </MainLayout>
    </ThemeProvider>
  )
}