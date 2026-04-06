import { useEffect, useState } from "react";
import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";
import { useDashboardStore } from "../stores/useDashboardStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,   // tambahin ini
} from "recharts";

export default function DashboardSummary() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    summary,
    bookingsByTime,
    loading,
    fetchSummary,
    fetchBookingsByTime,
    setDateFilter,
  } = useDashboardStore();

  // 🔥 DEFAULT AWAL & AKHIR BULAN
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 2);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const formatDate = (date: Date) =>
      date.toISOString().split("T")[0];

    const defaultFrom = formatDate(firstDay);
    const defaultTo = formatDate(lastDay);

    setFromDate(defaultFrom);
    setToDate(defaultTo);

    setDateFilter(defaultFrom, defaultTo);

    fetchSummary();
    fetchBookingsByTime();
  }, []);

  // 🔥 PIE DATA
  const breakdownData = summary
    ? [
      { name: "Waiting", value: summary.breakdown.waiting_list },
      { name: "Confirm", value: summary.breakdown.confirm },
      { name: "Seated", value: summary.breakdown.seated },
      { name: "Completed", value: summary.breakdown.completed },
      { name: "Cancelled", value: summary.breakdown.cancelled },
    ]
    : [];

  const totalValue = breakdownData.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  // 🔥 LINE CHART DATA
  const bookingsByTimeData = (bookingsByTime || []).map((item: any) => ({
    date: item.date,
    morning: item.morning || 0,
    afternoon: item.afternoon || 0,
    evening: item.evening || 0,
    night: item.night || 0,
  }));

  const renderPercentLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        stroke="none"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-[#EAEAEA] p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">
            Dashboard Summary
          </h1>

          {/* FILTER DATE */}
          <div className="flex gap-4 mb-6">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
            />

            <button
              onClick={() => {
                setDateFilter(fromDate, toDate);
                fetchSummary();
                fetchBookingsByTime();
              }}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Apply
            </button>
          </div>

          {loading && <p>Loading...</p>}

          {summary && (
            <>
              {/* 🔥 CARDS */}
              <div className="grid grid-cols-5 gap-4 mb-8">
                <Card title="Total Bookings" value={summary.totalBookings} />
                <Card title="Total Guests" value={summary.totalGuests} />
                <Card title="Total Pax" value={summary.totalPax} />
                <Card title="Avg Party Size" value={summary.avgPartySize} />
                <Card
                  title="Cancellation Rate"
                  value={`${summary.cancellationRate}%`}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-6">

                {/* 🔥 PIE CHART */}
                <div className="bg-white rounded-lg p-6 w-full lg:w-1/3">
                  <h2 className="font-semibold mb-4">
                    Booking Breakdown
                  </h2>

                  <div className="h-[350px]">

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          labelLine={false}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}      // bikin donut
                          outerRadius={120}
                          stroke="none"         // ❌ hilangkan garis putih
                          paddingAngle={2}
                          label={renderPercentLabel}    // kasih jarak halus antar slice (opsional)
                          isAnimationActive
                        >

                          {breakdownData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={[
                                "#facc15",
                                "#3b82f6",
                                "#10b981",
                                "#6366f1",
                                "#ef4444",
                              ][index]}
                            />
                          ))}
                        </Pie>
                        <text
                          x="50%"
                          y="45%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={14}
                          fill="#6b7280"
                        >
                          Total
                        </text>

                        <text
                          x="50%"
                          y="55%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={20}
                          fontWeight="bold"
                        >
                          {totalValue}
                        </text>

                        <Tooltip />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 🔥 LINE CHART */}
                {bookingsByTime && (
                  <div className="bg-white rounded-lg p-6 w-full lg:w-2/3">
                    <h2 className="font-semibold mb-4">
                      Bookings By Time
                    </h2>

                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bookingsByTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />

                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) =>
                              new Date(date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                              })
                            }
                          />

                          <YAxis allowDecimals={false} />

                          <Tooltip />

                          {/* 🔥 LEGEND */}
                          <Legend
                            content={() => (
                              <div className="flex gap-4 text-sm justify-center">
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-[#facc15] inline-block rounded-sm" />
                                  Morning
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-[#3b82f6] inline-block rounded-sm" />
                                  Afternoon
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-[#10b981] inline-block rounded-sm" />
                                  Evening
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-[#6366f1] inline-block rounded-sm" />
                                  Night
                                </span>
                              </div>
                            )}
                          />

                          <Line
                            type="monotone"
                            dataKey="morning"
                            name="Morning"
                            stroke="#facc15"
                          />

                          <Line
                            type="monotone"
                            dataKey="afternoon"
                            name="Afternoon"
                            stroke="#3b82f6"
                          />

                          <Line
                            type="monotone"
                            dataKey="evening"
                            name="Evening"
                            stroke="#10b981"
                          />

                          <Line
                            type="monotone"
                            dataKey="night"
                            name="Night"
                            stroke="#6366f1"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}