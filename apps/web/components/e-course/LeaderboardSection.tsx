import Link from "next/link";

type LeaderboardEntry = {
  rank: number;
  name: string;
  category: string;
  xp: number;
  percent: number;
  color: string;
};

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Budi Santoso", category: "Digital Marketing", xp: 2450, percent: 89, color: "#0077A8" },
  { rank: 2, name: "Rina Kusuma", category: "Data Science", xp: 2210, percent: 84, color: "#CC0052" },
  { rank: 3, name: "Kevin Wijaya", category: "Web Development", xp: 1980, percent: 77, color: "#0077A8" },
  { rank: 4, name: "Sari Indah", category: "UI/UX Design", xp: 1750, percent: 71, color: "#CC0052" },
  { rank: 5, name: "Ahmad Rizki", category: "Digital Marketing", xp: 1620, percent: 66, color: "#0077A8" },
  { rank: 6, name: "Maya Putri", category: "Microsoft Office", xp: 1490, percent: 62, color: "#CC0052" },
  { rank: 7, name: "Doni Pratama", category: "Data Science", xp: 1350, percent: 57, color: "#0077A8" },
  { rank: 8, name: "Fitri Handayani", category: "Web Development", xp: 1210, percent: 51, color: "#CC0052" },
  { rank: 9, name: "Hendra Saputra", category: "Product Management", xp: 1090, percent: 46, color: "#0077A8" },
  { rank: 10, name: "Lina Wati", category: "UI/UX Design", xp: 980, percent: 42, color: "#0077A8" },
];

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LeaderboardSection() {
  return (
    <section className="bg-[#F5F5F7] py-12 border-b border-[#E5E5E5]">
      <div className="max-w-[1152px] mx-auto px-8 flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold font-display text-[#1D1D1F]">
              Leaderboard Pelajar Aktif
            </h2>
            <p className="text-[#6E6E73] text-sm">
              Minggu ini · Diperbarui setiap Senin
            </p>
          </div>
          <Link
            href="/e-course"
            className="text-sm font-semibold text-[#0077A8] px-4 py-2 rounded-lg border border-[rgba(0,119,168,0.2)] bg-white hover:bg-[rgba(0,119,168,0.04)] transition-colors"
          >
            Lihat Semua
          </Link>
        </div>

        <ol className="bg-white border border-[#E5E5E5] rounded-2xl shadow-e1 divide-y divide-[#F5F5F7]">
          {leaderboard.map((entry) => (
            <li key={entry.rank} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <span className="w-8 text-center font-bold text-sm">
                {medals[entry.rank] ?? (
                  <span className="text-[#6E6E73]">{entry.rank}</span>
                )}
              </span>

              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none"
                style={{ background: entry.color }}
                aria-hidden="true"
              >
                {getInitials(entry.name)}
              </span>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[#1D1D1F] font-semibold text-sm truncate">
                  {entry.name}
                </span>
                <span className="text-[#6E6E73] text-xs truncate">{entry.category}</span>
              </div>

              <span className="hidden sm:inline-flex bg-[rgba(0,119,168,0.07)] text-[#0077A8] text-xs font-bold px-2 py-0.5 rounded-full flex-none">
                {entry.xp.toLocaleString("id-ID")} XP
              </span>

              <div
                role="progressbar"
                aria-valuenow={entry.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress ${entry.name}: ${entry.percent}%`}
                className="hidden md:block w-20 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden flex-none"
              >
                <div
                  className="h-full bg-[#0077A8] rounded-full"
                  style={{ width: `${entry.percent}%` }}
                />
              </div>

              <span className="text-[#636366] text-xs w-8 text-right flex-none">
                {entry.percent}%
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E5E5E5] rounded-2xl shadow-e1 px-6 py-5">
          <p className="text-[#1D1D1F] font-semibold text-sm text-center sm:text-left">
            Bergabung dan mulai kumpulkan XP kamu
          </p>
          <Link href="/e-course" className="btn btn-primary flex-none">
            Mulai Belajar Gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
