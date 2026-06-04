"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Building2,
  IndianRupee,
  Users,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock,
  Activity,
  ChevronRight,
  BarChart3
} from "lucide-react";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import "../owner.css";

// Utility for Line Chart Path
const getBezierPath = (data, width, height, paddingLeft = 80, paddingRight = 20, paddingTop = 20, paddingBottom = 40, maxVal) => {
  if (!data || data.length < 2) return "";
  const max = maxVal || Math.max(...data.map(d => d.revenue)) || 100;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => ({
    x: paddingLeft + (i * chartWidth / (data.length - 1)),
    y: height - paddingBottom - (d.revenue / max * chartHeight)
  }));

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = (p0.x + p1.x) / 2;
    path += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
  }
  return path;
};

// Calculate nice round increments and max bounds for Y-Axis labels
const getNiceYAxisSettings = (maxVal) => {
  if (maxVal <= 0) return { max: 100, step: 25, numSteps: 4 };

  const log10 = Math.log10(maxVal);
  const power = Math.floor(log10);
  const magnitude = Math.pow(10, power - 1) || 1;

  const multipliers = [1, 2, 2.5, 3, 4, 5, 10];

  let bestStep = magnitude * 10;
  let bestNumSteps = 4;
  let minOverhead = Infinity;

  for (let mult of multipliers) {
    const candidateStep = mult * magnitude;
    for (let steps = 3; steps <= 5; steps++) {
      const candidateMax = candidateStep * steps;
      if (candidateMax >= maxVal) {
        const overhead = candidateMax - maxVal;
        if (overhead < minOverhead) {
          minOverhead = overhead;
          bestStep = candidateStep;
          bestNumSteps = steps;
        }
      }
    }
  }

  return { max: bestStep * bestNumSteps, step: bestStep, numSteps: bestNumSteps };
};

export default function OwnerDashboard() {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardInfo, setDashboardInfo] = useState({ grounds: [], handlers: [] });
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30");
  const [numLabels, setNumLabels] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setNumLabels(window.innerWidth < 640 ? 3 : 5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (token) fetchAnalytics(timeRange);
  }, [token, timeRange]);

  const fetchAnalytics = async (range = "30") => {
    if (!analytics) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const [analyticsRes, infoRes] = await Promise.all([
        fetch(`/api/bookings/owner/analytics?days=${range}`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`/api/grounds/dashboard-info`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (analyticsRes.ok && infoRes.ok) {
        const data = await analyticsRes.json();
        const infoData = await infoRes.json();
        setAnalytics(data);
        setDashboardInfo(infoData);
      } else {
        const errData = await analyticsRes.json();
        setError(errData.detail || "Failed to load analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute role="owner">
        <div className="pg-body" style={{ alignItems: "center", justifyContent: "center" }}>
          <Activity className="animate-spin" size={48} color="var(--teal)" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !analytics) {
    return (
      <ProtectedRoute role="owner">
        <div className="pg-body">
          <OwnerSidebar />
          <main className="pg-main">
            <div className="pg-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-2">
                {error ? "Oops! Something went wrong" : "No Analytics Available"}
              </h2>
              <p className="text-gray-500 max-w-md mb-8">
                {error || "Once you have your first booking, your business intelligence will appear here."}
              </p>
              {error && (
                <button
                  onClick={fetchAnalytics}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                >
                  Try Again
                </button>
              )}
              {!error && (
                <Link
                  href="/owner/add-ground"
                  className="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all"
                >
                  List Your First Ground
                </Link>
              )}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const { summary, revenue_by_day, revenue_by_ground, bookings_by_sport, peak_hours } = analytics;

  // Calculate chart metadata
  const rawMax = Math.max(...(revenue_by_day || []).map(d => d.revenue)) || 100;
  const niceMax = 9000;
  const niceStep = 3000;
  const numSteps = 3;

  const xLabels = [];
  if (revenue_by_day && revenue_by_day.length > 0) {
    const len = revenue_by_day.length;
    for (let i = 0; i < numLabels; i++) {
      const idx = Math.min(len - 1, Math.floor((i * (len - 1)) / (numLabels - 1)));
      if (!xLabels.some(x => x.idx === idx)) {
        xLabels.push({ idx, item: revenue_by_day[idx] });
      }
    }
  }

  const formatYLabel = (val) => {
    if (val === 0) return "₹0";
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) {
      const kVal = val / 1000;
      return `₹${Number.isInteger(kVal) ? kVal : kVal.toFixed(1)}k`;
    }
    return `₹${Math.round(val)}`;
  };

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "MMM d");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
        <main className="pg-main">
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Owner Panel › <span>Analytics Dashboard</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip"><div className="pg-pulse" /> Live Stats</div>
            </div>
          </div>

          <div className="pg-container">
            <div className="pg-page-header">
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Revenue Intelligence</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Deep dive into your business performance and player behavior.</p>
              </div>
              <div className="pg-range-picker">
                {["7", "30", "90"].map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`pg-range-btn ${timeRange === r ? "active" : ""}`}
                  >
                    Last {r} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Metrics */}
            <div className="pg-grid pg-grid-4" style={{ marginBottom: 32 }}>
              <MetricCard icon={<IndianRupee size={18} />} label="Total Revenue" value={`₹${summary.total_revenue.toLocaleString()}`} trend="+12.5%" href="/owner/bookings" />
              <MetricCard icon={<Activity size={18} />} label="Total Bookings" value={summary.confirmed_count} trend="+4.2%" href="/owner/bookings" />
              <MetricCard icon={<Building2 size={18} />} label="Total Venues" value={dashboardInfo.grounds.length} href="/owner/grounds" />
              <MetricCard icon={<Users size={18} />} label="Active Handlers" value={dashboardInfo.handlers.filter(h => h.is_active).length} href="/owner/handlers" />
            </div>

            {/* Venues & Handlers Grid */}
            <div className="pg-card" style={{ marginBottom: 32, padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 className="pg-section-title">Venues & Handlers Overview</h3>
                <Link href="/owner/handlers" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  Manage Handlers <ChevronRight size={16} />
                </Link>
              </div>
              {dashboardInfo.grounds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardInfo.grounds.map(ground => (
                    <div key={ground.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 truncate pr-2">{ground.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ground.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {ground.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-1">{ground.location?.city || ground.location?.address}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200 mt-auto">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assigned Handler</p>
                        {ground.handler_info ? (
                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {ground.handler_info.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{ground.handler_info.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{ground.handler_info.role}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-dashed border-gray-300">
                            <span className="text-xs text-gray-400 italic">No Handler Assigned</span>
                            <Link href="/owner/handlers" className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">Assign</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No venues found. <Link href="/owner/add-ground" className="text-teal-600 font-bold hover:underline">Add your first venue.</Link>
                </div>
              )}
            </div>

            {/* Row 2: Revenue Chart */}
            <div className="pg-card" style={{ marginBottom: 32, padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h3 className="pg-section-title">Revenue Growth</h3>
                <div style={{ display: "flex", gap: 16 }}>
                  <div className="pg-legend-item"><span style={{ background: "var(--teal)" }} /> Revenue</div>
                </div>
              </div>
              <div className="pg-chart-scroll-container">
                <div className="pg-chart-inner-wrapper">
                  <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity="0.2" />
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {Array.from({ length: numSteps + 1 }).map((_, i) => {
                    const yVal = 20 + i * (240 / numSteps);
                    return (
                      <line key={i} x1="80" y1={yVal} x2="980" y2={yVal} stroke="#f1f5f9" strokeWidth="1" />
                    );
                  })}

                  {/* Y-axis Labels (Amounts) */}
                  {Array.from({ length: numSteps + 1 }).map((_, i) => {
                    const yVal = 20 + i * (240 / numSteps);
                    const labelVal = niceMax - (i * niceStep);
                    return (
                      <text
                        key={`y-label-${i}`}
                        x="65"
                        y={yVal + 4}
                        textAnchor="end"
                        fill="var(--text-muted)"
                        style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font)" }}
                      >
                        {formatYLabel(labelVal)}
                      </text>
                    );
                  })}

                  {/* X-axis Labels (Dates) */}
                  {xLabels.map(({ idx, item }) => {
                    const chartWidth = 1000 - 80 - 20;
                    const xVal = 80 + (idx * chartWidth / (revenue_by_day.length - 1));
                    return (
                      <text
                        key={`x-label-${idx}`}
                        x={xVal}
                        y="285"
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font)" }}
                      >
                        {formatDateLabel(item.date)}
                      </text>
                    );
                  })}

                  <path
                    d={`${getBezierPath(revenue_by_day, 1000, 300, 80, 20, 20, 40, niceMax)} L 980,260 L 80,260 Z`}
                    fill="url(#chartGradient)"
                    className="fade-in"
                  />
                  <path
                    d={getBezierPath(revenue_by_day, 1000, 300, 80, 20, 20, 40, niceMax)}
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="draw-path"
                  />
                </svg>
              </div>
              </div>
            </div>

            <div className="pg-grid pg-grid-2" style={{ marginBottom: 32 }}>
              {/* Row 3: Revenue by Ground */}
              <div className="pg-card" style={{ padding: 32 }}>
                <h3 className="pg-section-title" style={{ marginBottom: 24 }}>Revenue by Ground</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {revenue_by_ground.length > 0 ? revenue_by_ground.map((g, i) => {
                    const max = Math.max(...revenue_by_ground.map(rg => rg.revenue)) || 1;
                    const width = (g.revenue / max) * 100;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{g.ground_name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>₹{g.revenue.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            className="grow-width"
                            style={{
                              "--target-width": `${width}%`,
                              height: "100%",
                              background: "var(--teal)",
                              borderRadius: 4
                            }}
                          />
                        </div>
                      </div>
                    );
                  }) : <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data available</p>}
                </div>
              </div>

              {/* Row 3: Bookings by Sport */}
              <div className="pg-card" style={{ padding: 32 }}>
                <h3 className="pg-section-title" style={{ marginBottom: 24 }}>Bookings by Sport</h3>
                {bookings_by_sport.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 40, height: "100%" }}>
                    <div style={{ position: "relative", width: 140, height: 140 }}>
                      <svg width="140" height="140" viewBox="0 0 42 42">
                        {bookings_by_sport.map((s, i) => {
                          const total = bookings_by_sport.reduce((acc, curr) => acc + curr.count, 0);
                          const prevTotal = bookings_by_sport.slice(0, i).reduce((acc, curr) => acc + curr.count, 0);
                          const startPercent = (prevTotal / total) * 100;
                          const percent = (s.count / total) * 100;
                          const colors = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22"];
                          return (
                            <circle
                              key={i}
                              cx="21" cy="21" r="15.9155"
                              fill="transparent"
                              stroke={colors[i % colors.length]}
                              strokeWidth="5"
                              strokeDasharray={`${percent} ${100 - percent}`}
                              strokeDashoffset={-startPercent + 25}
                              className="donut-segment"
                            />
                          );
                        })}
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{summary.confirmed_count}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {bookings_by_sport.map((s, i) => {
                        const colors = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22"];
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i % colors.length] }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "capitalize" }}>{s.sport_type}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(s.count / summary.confirmed_count * 100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data available</p>}
              </div>
            </div>

            {/* Row 4: Peak Hours Heatmap */}
            <div className="pg-card" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 className="pg-section-title">Peak Booking Hours</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Quiet</span>
                  <div style={{ width: 60, height: 8, background: "linear-gradient(to right, #eefcf9, var(--teal))", borderRadius: 4 }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Busiest</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, height: 160, alignItems: "flex-end", paddingBottom: 20 }}>
                {peak_hours.map((h, i) => {
                  const max = Math.max(...peak_hours.map(ph => ph.count)) || 1;
                  const height = (h.count / max) * 100;
                  const opacity = 0.1 + (h.count / max) * 0.9;
                  if (h.hour < 6 || h.hour > 22) return null;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div
                        className="grow-height"
                        style={{
                          "--target-height": `${Math.max(height, 5)}%`,
                          width: "100%",
                          background: "var(--teal)",
                          opacity: opacity,
                          borderRadius: "6px 6px 0 0",
                          minHeight: 4,
                          transition: "all 0.3s"
                        }}
                      />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                        {h.hour > 12 ? `${h.hour - 12} PM` : `${h.hour} AM`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        <style>{`
          .pg-range-picker { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; }
          .pg-range-btn { padding: 8px 16px; border: none; background: none; font-size: 11px; font-weight: 700; color: var(--text-muted); cursor: pointer; border-radius: 8px; transition: all 0.2s; }
          .pg-range-btn.active { background: white; color: var(--teal); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .pg-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
          .pg-legend-item span { width: 10px; height: 10px; border-radius: 3px; }
          .fade-in { opacity: 0; animation: fadeIn 0.8s ease forwards; }
          .draw-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 1.5s ease-out forwards; }
          .grow-width { width: 0; animation: growWidth 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
          .grow-height { height: 0; animation: growHeight 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
          @keyframes fadeIn { to { opacity: 1; } }
          @keyframes draw { to { stroke-dashoffset: 0; } }
          @keyframes growWidth { to { width: var(--target-width); } }
          @keyframes growHeight { to { height: var(--target-height); } }
          .donut-segment { transition: stroke-dasharray 0.3s ease; }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
function MetricCard({ icon, label, value, trend, negative, href }) {
  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdfa", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        {trend && (
          <div style={{ fontSize: 11, fontWeight: 700, color: negative ? "#ef4444" : "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
            {negative ? "↓" : "↑"} {trend}
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{value}</h3>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="pg-card-interactive" style={{ padding: 24, marginBottom: 0, textDecoration: "none", display: "block" }}>
        {content}
      </Link>
    );
  }

  return (
    <div className="pg-card" style={{ padding: 24, marginBottom: 0 }}>
      {content}
    </div>
  );
}
