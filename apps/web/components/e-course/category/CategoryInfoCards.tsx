import type { InfoCard } from "@/lib/e-course/types";

type CategoryInfoCardsProps = {
  cards: InfoCard[];
};

export function CategoryInfoCards({ cards }: CategoryInfoCardsProps) {
  return (
    <section className="py-10 border-b border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-3">
              <div className="pb-2 border-b-2 border-[#0077A8]">
                <h3 className="text-[#1D1D1F] font-semibold text-base">{card.title}</h3>
              </div>
              <p className="text-[#636366] text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
