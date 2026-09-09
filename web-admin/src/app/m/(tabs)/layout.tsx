import { BottomTabBar } from '@/components/member/bottom-tab-bar';
import { FeedComposer } from '@/components/member/feed-composer';
import { MemberAuthGuard } from '@/components/member/member-auth-guard';

export default function MemberTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberAuthGuard>
      <div className="min-h-dvh pb-16">
        {children}
        <FeedComposer />
        <BottomTabBar />
      </div>
    </MemberAuthGuard>
  );
}
