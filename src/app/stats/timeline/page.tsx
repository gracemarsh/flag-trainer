import { PageContainer } from "@/components/page-container";

export default function TimelinePage() {
  return (
    <PageContainer>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Learning Timeline</h1>
        <p className="text-muted-foreground">
          Timeline statistics will be displayed here.
        </p>
      </div>
    </PageContainer>
  );
}
