export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10 py-12">
        <div className="max-w-[1152px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-video rounded-2xl bg-[#141414]" />
            <div className="flex flex-col gap-4">
              <div className="h-4 w-32 rounded bg-[#1f1f1f]" />
              <div className="h-8 w-3/4 rounded bg-[#1f1f1f]" />
              <div className="h-16 rounded bg-[#1f1f1f]" />
              <div className="h-10 rounded-xl bg-[#141414]" />
            </div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="py-10 max-w-[1152px] mx-auto px-8">
        <div className="h-6 w-48 rounded bg-[#1f1f1f] mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8">
            <div className="h-5 w-40 rounded bg-[#1f1f1f] mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex-none w-52 aspect-video rounded-xl bg-[#141414]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
