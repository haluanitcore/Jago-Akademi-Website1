export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-b from-[rgba(0,119,168,0.05)] to-[#F5F5F7] border-b border-[#E5E5E5] py-10">
        <div className="max-w-[1152px] mx-auto px-8">
          <div className="h-3 w-48 rounded bg-[#E5E5E5] mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="h-4 w-32 rounded bg-[#EFEFEF]" />
              <div className="h-7 w-2/3 rounded bg-[#E5E5E5]" />
              <div className="h-4 w-40 rounded bg-[#EFEFEF]" />
            </div>
            <div className="h-24 rounded-xl bg-[#E5E5E5]" />
          </div>
        </div>
      </div>
      <div className="py-10 max-w-[1152px] mx-auto px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#E5E5E5] aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  );
}
