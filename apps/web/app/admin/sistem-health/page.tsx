"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken } from "@/lib/auth/token";

/* ─────────────────────────── Types ────────────────────────────────────────── */
type ChartPoint = { date: string; amount?: number; count?: number };
type OrderDist = { status: string; count: number; color: string };
type TopCourse = { title: string; enrolled: number; rating: number; trainer: string };
type DbOverview = Record<string, number>;

type HealthData = {
  revenue: { chart: ChartPoint[]; total: number };
  users: { chart: ChartPoint[]; total: number; activeToday: number };
  enrollments: { chart: ChartPoint[]; total: number };
  orders: { distribution: OrderDist[]; total: number };
  topCourses: TopCourse[];
  dbOverview: DbOverview;
};

/* ─────────────────────────── SVG Charts ──────────────────────────────────── */

/** Pure SVG Line Chart */
function LineChart({
  data,
  valueKey,
  color,
  gradientId,
  height = 200,
  prefix = "",
  suffix = "",
}: {
  data: ChartPoint[];
  valueKey: "amount" | "count";
  color: string;
  gradientId: string;
  height?: number;
  prefix?: string;
  suffix?: string;
}) {
  if (!data.length) return <p className="sh-empty">Tidak ada data.</p>;

  const values = data.map((d) => (d as Record<string, number>)[valueKey] ?? 0);
  const maxVal = Math.max(...values, 1);
  const w = 560;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const points = values.map((v, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: pad.top + chartH - (v / maxVal) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = Math.round((maxVal / yTicks) * i);
    return { val, y: pad.top + chartH - (val / maxVal) * chartH };
  });

  const formatVal = (v: number) => {
    if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M${suffix}`;
    if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(0)}K${suffix}`;
    return `${prefix}${v}${suffix}`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sh-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map(({ val, y }) => (
        <g key={val}>
          <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
          <text x={pad.left - 8} y={y + 4} textAnchor="end" className="sh-tick">{formatVal(val)}</text>
        </g>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => {
        const x = pad.left + (i / Math.max(data.length - 1, 1)) * chartW;
        const label = d.date.slice(5); // "07" from "2026-07"
        return i % 2 === 0 ? (
          <text key={d.date} x={x} y={h - 8} textAnchor="middle" className="sh-tick">{label}</text>
        ) : null;
      })}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
          <title>{`${data[i].date}: ${formatVal(values[i])}`}</title>
        </g>
      ))}
    </svg>
  );
}

/** Pure SVG Bar Chart */
function BarChart({
  data,
  valueKey,
  color,
  height = 200,
}: {
  data: ChartPoint[];
  valueKey: "amount" | "count";
  color: string;
  height?: number;
}) {
  if (!data.length) return <p className="sh-empty">Tidak ada data.</p>;

  const values = data.map((d) => (d as Record<string, number>)[valueKey] ?? 0);
  const maxVal = Math.max(...values, 1);
  const w = 560;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW = (chartW / data.length) * 0.6;
  const gap = (chartW / data.length) * 0.4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sh-svg" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = pad.top + chartH * (1 - pct);
        return (
          <g key={pct}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" className="sh-tick">{Math.round(maxVal * pct)}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const v = values[i];
        const barH = (v / maxVal) * chartH;
        const x = pad.left + i * (barW + gap) + gap / 2;
        const y = pad.top + chartH - barH;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85}>
              <title>{`${d.date}: ${v}`}</title>
            </rect>
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" className="sh-tick">{d.date.slice(5)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Pure SVG Donut Chart */
function DonutChart({ data, size = 180 }: { data: OrderDist[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <p className="sh-empty">Tidak ada data order.</p>;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const innerR = r * 0.6;
  let cumAngle = -90;

  const slices = data
    .filter((d) => d.count > 0)
    .map((d) => {
      const pct = d.count / total;
      const startAngle = cumAngle;
      cumAngle += pct * 360;
      const endAngle = cumAngle;

      const s1 = (startAngle * Math.PI) / 180;
      const e1 = (endAngle * Math.PI) / 180;

      const x1 = cx + r * Math.cos(s1);
      const y1 = cy + r * Math.sin(s1);
      const x2 = cx + r * Math.cos(e1);
      const y2 = cy + r * Math.sin(e1);
      const ix1 = cx + innerR * Math.cos(e1);
      const iy1 = cy + innerR * Math.sin(e1);
      const ix2 = cx + innerR * Math.cos(s1);
      const iy2 = cy + innerR * Math.sin(s1);

      const large = pct > 0.5 ? 1 : 0;
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;

      return { ...d, path, pct };
    });

  const STATUS_LABELS: Record<string, string> = {
    paid: "Dibayar",
    pending: "Menunggu",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    refunded: "Refund",
  };

  return (
    <div className="sh-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {slices.map((s) => (
          <path key={s.status} d={s.path} fill={s.color} stroke="white" strokeWidth={2}>
            <title>{`${STATUS_LABELS[s.status] ?? s.status}: ${s.count} (${(s.pct * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="sh-donut-total">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="sh-donut-label">Total</text>
      </svg>
      <div className="sh-legend">
        {data.filter((d) => d.count > 0).map((d) => (
          <div key={d.status} className="sh-legend-item">
            <span className="sh-legend-dot" style={{ background: d.color }} />
            <span className="sh-legend-text">{STATUS_LABELS[d.status] ?? d.status}</span>
            <span className="sh-legend-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bar chart for Top Courses */
function HorizontalBarChart({ data }: { data: TopCourse[] }) {
  if (!data.length) return <p className="sh-empty">Belum ada kursus.</p>;
  const max = Math.max(...data.map((d) => d.enrolled), 1);

  return (
    <div className="sh-hbar-list">
      {data.map((c, i) => (
        <div key={i} className="sh-hbar-row">
          <div className="sh-hbar-rank">#{i + 1}</div>
          <div className="sh-hbar-info">
            <p className="sh-hbar-title">{c.title}</p>
            <p className="sh-hbar-trainer">{c.trainer}</p>
          </div>
          <div className="sh-hbar-bar-wrap">
            <div
              className="sh-hbar-bar"
              style={{ width: `${Math.max((c.enrolled / max) * 100, 4)}%` }}
            />
            <span className="sh-hbar-val">{c.enrolled} enrolled</span>
          </div>
          <div className="sh-hbar-rating">⭐ {c.rating.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Page Component ──────────────────────────────── */

const DB_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  users: { label: "Users", icon: "👥", color: "#0077A8" },
  courses: { label: "Kursus", icon: "📖", color: "#7C3AED" },
  orders: { label: "Orders", icon: "💳", color: "#059669" },
  enrollments: { label: "Enrollment", icon: "🎓", color: "#DC2626" },
  reviews: { label: "Review", icon: "⭐", color: "#F59E0B" },
  blogs: { label: "Blog", icon: "✍️", color: "#EC4899" },
  events: { label: "Event", icon: "🎫", color: "#8B5CF6" },
  ebooks: { label: "E-Book", icon: "📘", color: "#0891B2" },
  leads: { label: "Leads", icon: "📋", color: "#64748B" },
  payouts: { label: "Payouts", icon: "💰", color: "#059669" },
};

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system-health", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastRefresh(new Date());
      } else {
        setError(json.error?.message ?? "Gagal memuat data.");
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="sh-loading">
        <span className="sh-spinner" />
        <style jsx>{`
          .sh-loading { display:flex; justify-content:center; align-items:center; min-height:50vh; }
          .sh-spinner { width:36px; height:36px; border-radius:50%; border:3px solid #0077A8; border-top-color:transparent; animation:spin .8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="sh-error">
        <p>❌ {error ?? "Data tidak tersedia"}</p>
        <button onClick={fetchData}>Coba Lagi</button>
        <style jsx>{`
          .sh-error { text-align:center; padding:60px 20px; color:#EF4444; }
          .sh-error button { margin-top:16px; padding:8px 20px; border-radius:8px; border:1px solid #0077A8; color:#0077A8; background:white; cursor:pointer; font-weight:600; }
          .sh-error button:hover { background:#E8F4F9; }
        `}</style>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Users", value: data.users.total.toLocaleString("id-ID"), icon: "👥", color: "#0077A8", bg: "#E8F4F9" },
    { label: "Active (24h)", value: data.users.activeToday.toLocaleString("id-ID"), icon: "🟢", color: "#059669", bg: "#D1FAE5" },
    { label: "Total Revenue", value: `Rp ${data.revenue.total.toLocaleString("id-ID")}`, icon: "💰", color: "#DC2626", bg: "#FEE2E2" },
    { label: "Total Orders", value: data.orders.total.toLocaleString("id-ID"), icon: "💳", color: "#7C3AED", bg: "#EDE9FE" },
    { label: "Enrollments", value: data.enrollments.total.toLocaleString("id-ID"), icon: "🎓", color: "#059669", bg: "#D1FAE5" },
    { label: "Top Rating", value: data.topCourses[0] ? `⭐ ${data.topCourses[0].rating.toFixed(1)}` : "-", icon: "🏆", color: "#F59E0B", bg: "#FEF3C7" },
  ];

  return (
    <div className="sh-page">
      {/* Header */}
      <div className="sh-header">
        <div>
          <h1 className="sh-title">Kesehatan Sistem</h1>
          <p className="sh-subtitle">
            Visualisasi data real-time platform Jago Akademi
            {lastRefresh && <span className="sh-refresh-time"> · Terakhir: {lastRefresh.toLocaleTimeString("id-ID")}</span>}
          </p>
        </div>
        <button type="button" className="sh-refresh-btn" onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>

      {/* KPI Summary */}
      <div className="sh-kpi-grid">
        {kpiCards.map((k) => (
          <div key={k.label} className="sh-kpi-card">
            <div className="sh-kpi-icon" style={{ background: k.bg }}>
              <span>{k.icon}</span>
            </div>
            <div className="sh-kpi-body">
              <p className="sh-kpi-value" style={{ color: k.color }}>{k.value}</p>
              <p className="sh-kpi-label">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Revenue + User Growth */}
      <div className="sh-grid-2">
        <div className="sh-card">
          <div className="sh-card-head">
            <h2>💰 Tren Revenue (12 Bulan)</h2>
          </div>
          <LineChart data={data.revenue.chart} valueKey="amount" color="#0077A8" gradientId="revGrad" prefix="Rp " />
        </div>
        <div className="sh-card">
          <div className="sh-card-head">
            <h2>👥 Pertumbuhan User (12 Bulan)</h2>
          </div>
          <BarChart data={data.users.chart} valueKey="count" color="#7C3AED" />
        </div>
      </div>

      {/* Charts Row 2: Enrollment + Order Distribution */}
      <div className="sh-grid-2">
        <div className="sh-card">
          <div className="sh-card-head">
            <h2>🎓 Tren Enrollment (12 Bulan)</h2>
          </div>
          <LineChart data={data.enrollments.chart} valueKey="count" color="#059669" gradientId="enrGrad" />
        </div>
        <div className="sh-card">
          <div className="sh-card-head">
            <h2>📊 Distribusi Status Order</h2>
          </div>
          <DonutChart data={data.orders.distribution} />
        </div>
      </div>

      {/* Top Courses */}
      <div className="sh-card">
        <div className="sh-card-head">
          <h2>🏆 Top 5 Kursus Terpopuler</h2>
        </div>
        <HorizontalBarChart data={data.topCourses} />
      </div>

      {/* Database Overview */}
      <div className="sh-card">
        <div className="sh-card-head">
          <h2>🗄️ Database Overview</h2>
        </div>
        <div className="sh-db-grid">
          {Object.entries(data.dbOverview).map(([key, count]) => {
            const meta = DB_LABELS[key] ?? { label: key, icon: "📁", color: "#6B7280" };
            return (
              <div key={key} className="sh-db-item">
                <div className="sh-db-icon">{meta.icon}</div>
                <div className="sh-db-count" style={{ color: meta.color }}>{count.toLocaleString("id-ID")}</div>
                <div className="sh-db-label">{meta.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Styles ──────────────────────────────────────────────────────── */}
      <style jsx global>{`
        .sh-page { display: flex; flex-direction: column; gap: 20px; }

        /* Header */
        .sh-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .sh-title { font-size: 24px; font-weight: 800; color: #1D1D1F; letter-spacing: -0.02em; }
        .sh-subtitle { font-size: 13px; color: #6E6E73; margin-top: 4px; }
        .sh-refresh-time { color: #0077A8; font-weight: 500; }
        .sh-refresh-btn {
          padding: 8px 18px; border-radius: 10px; border: 1px solid rgba(0,119,168,0.2);
          background: white; color: #0077A8; font-weight: 600; font-size: 13px;
          cursor: pointer; transition: all 0.18s;
        }
        .sh-refresh-btn:hover { background: #E8F4F9; border-color: #0077A8; }

        /* KPI Grid */
        .sh-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
        .sh-kpi-card {
          display: flex; align-items: center; gap: 14px;
          background: white; border-radius: 14px; padding: 16px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .sh-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .sh-kpi-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .sh-kpi-body { min-width: 0; }
        .sh-kpi-value { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sh-kpi-label { font-size: 11px; color: #6E6E73; margin-top: 2px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em; }

        /* Grid */
        .sh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .sh-grid-2 { grid-template-columns: 1fr; } }

        /* Cards */
        .sh-card { background: white; border-radius: 16px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .sh-card-head { margin-bottom: 16px; }
        .sh-card-head h2 { font-size: 15px; font-weight: 700; color: #1D1D1F; }

        /* SVG Charts */
        .sh-svg { width: 100%; height: auto; }
        .sh-tick { font-size: 9px; fill: #9CA3AF; font-family: 'Inter', sans-serif; }
        .sh-empty { text-align: center; color: #9CA3AF; padding: 40px 0; font-size: 13px; }

        /* Donut */
        .sh-donut-wrap { display: flex; align-items: center; gap: 24px; justify-content: center; flex-wrap: wrap; }
        .sh-donut-total { font-size: 22px; font-weight: 800; fill: #1D1D1F; font-family: 'Inter', sans-serif; }
        .sh-donut-label { font-size: 10px; fill: #9CA3AF; font-family: 'Inter', sans-serif; }
        .sh-legend { display: flex; flex-direction: column; gap: 8px; }
        .sh-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .sh-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .sh-legend-text { color: #374151; min-width: 80px; }
        .sh-legend-count { font-weight: 700; color: #1D1D1F; }

        /* Horizontal bar chart */
        .sh-hbar-list { display: flex; flex-direction: column; gap: 12px; }
        .sh-hbar-row { display: flex; align-items: center; gap: 12px; }
        .sh-hbar-rank { width: 28px; height: 28px; border-radius: 8px; background: #F0F2F5; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6E6E73; flex-shrink: 0; }
        .sh-hbar-info { flex: 1; min-width: 0; }
        .sh-hbar-title { font-size: 13px; font-weight: 600; color: #1D1D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sh-hbar-trainer { font-size: 11px; color: #9CA3AF; }
        .sh-hbar-bar-wrap { width: 200px; flex-shrink: 0; position: relative; }
        .sh-hbar-bar { height: 22px; border-radius: 6px; background: linear-gradient(90deg, #0077A8, #00B4D8); min-width: 8px; transition: width 0.5s ease; }
        .sh-hbar-val { position: absolute; right: 0; top: 3px; font-size: 11px; font-weight: 600; color: #6E6E73; padding-left: 8px; }
        .sh-hbar-rating { font-size: 12px; color: #F59E0B; font-weight: 600; flex-shrink: 0; width: 60px; text-align: right; }

        /* DB Overview */
        .sh-db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
        .sh-db-item { text-align: center; padding: 16px 8px; border-radius: 12px; background: #F8FAFC; transition: transform 0.18s; }
        .sh-db-item:hover { transform: translateY(-2px); background: #F0F2F5; }
        .sh-db-icon { font-size: 24px; margin-bottom: 6px; }
        .sh-db-count { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
        .sh-db-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 600; margin-top: 2px; letter-spacing: 0.04em; }
      `}</style>
    </div>
  );
}
