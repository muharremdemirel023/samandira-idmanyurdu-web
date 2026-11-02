import { Container } from "@/components/ui/Container";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none ${className}`} />;
}

export default function LigMerkeziLoading() {
  return (
    <div className="flex flex-1 flex-col bg-surface-base" aria-busy="true">
      <Container className="pb-16 pt-[calc(var(--header-height)+0.75rem)] md:pt-[calc(var(--header-height)+1rem)]">
        <p className="sr-only" role="status">
          Lig bilgileri yükleniyor…
        </p>
        <Block className="h-3 w-28" />
        <Block className="mt-4 h-9 w-56" />
        <Block className="mt-5 h-4 w-full max-w-md" />
        <div className="mt-10 flex gap-2">
          <Block className="h-11 w-32 rounded-full" />
          <Block className="h-11 w-28 rounded-full" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Block key={index} className="h-24" />
          ))}
        </div>
        <Block className="mt-6 h-56" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Block key={index} className="h-52" />
          ))}
        </div>
      </Container>
    </div>
  );
}
