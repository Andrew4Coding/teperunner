import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '../context/theme-provider';

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex relative w-[48px]">
      <div
        className="flex relative w-full h-fit border-[2px] border-[#1A2223] rounded-[21px] md:rounded-[24px] cursor-pointer items-center"
        onClick={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
        }}
        aria-label="toggle theme"
      >
        <span className="flex w-[50%] relative rounded-full -left-[1%] dark:translate-x-[103%] bg-[#1A2223] transition-all items-center justify-center p-1">
          <MoonStar className="w-full h-full hidden dark:block dark:text-white" />
          <Sun className="w-full h-full block dark:hidden text-white" />
        </span>
      </div>
    </div>
  );
}
