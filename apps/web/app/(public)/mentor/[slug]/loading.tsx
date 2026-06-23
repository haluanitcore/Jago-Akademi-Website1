export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-b from-[#001a20] to-[#0d0d0d] border-b border-[#00d4ff]/10 py-12">
        <div className="max-w-[1152px] mx-auto px-8">
          <div className="flex gap-8">
            <div className="w-24 h-24 rounded-2xl bg-[#141414]" />
            <div className="flex flex-col gap-3 flex-1">
              <div className="h-7 w-48 rounded bg-[#1f1f1f]" />
              <div className="h-4 w-64 rounded bg-[#1f1f1f]" />
              <div className="h-16 rounded bg-[#1f1f1f]" />
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-20 rounded bg-[#1f1f1f]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-10 max-w-[1152px] mx-auto px-8">
        <div className="h-6 w-48 rounded bg-[#1f1f1f] mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[#141414]" />
          ))}
        </div>
      </div>
    </div>
  );
}
