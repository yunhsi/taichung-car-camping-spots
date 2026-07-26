import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="page-glow flex flex-1 flex-col bg-background font-sans transition-colors">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-6 py-16">
        <div className="w-full">
          <EmptyState
            title="找不到這個頁面"
            description="網址可能有誤，或頁面已經不存在。"
            headingLevel="h1"
            action={
              <ButtonLink href="/">回首頁探索景點</ButtonLink>
            }
          />
        </div>
      </main>
    </div>
  );
}
