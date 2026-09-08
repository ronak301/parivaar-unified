import { MemberAuthProvider } from '@/context/member-auth-context';

// `member-app` activates the design tokens from ./theme.css for everything under /m;
// `m-page` paints the (possibly gradient) page background.
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberAuthProvider>
      <div className="member-app m-page mx-auto min-h-dvh w-full max-w-md text-m-ink shadow-xl">
        {children}
      </div>
    </MemberAuthProvider>
  );
}
