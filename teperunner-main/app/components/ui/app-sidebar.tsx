import { LayoutGrid } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar';
import { getAuthClient } from '~/lib/auth.client';
import { Button } from './button';

const UTILS_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutGrid />,
  },
];

export function AppSidebar() {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && menuRefs.current[activeIndex]) {
      menuRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleLogout = async () => {
    const authClient = getAuthClient();

    await authClient.signOut();

    navigate('/login', { replace: true });
  }

  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <SidebarGroup className="gap-8">
          <div>
            <SidebarGroupContent className="max-h-96 overflow-auto">
              <SidebarMenu>
                {UTILS_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground rounded'
                            : ''
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={handleLogout}
        >Log Out</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
