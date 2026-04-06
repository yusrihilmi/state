import { useEffect, useState } from "react";
import BookingManagementModal from "../modal/BookingManagementModal";
import { useBookingStore } from "../../stores/useBookingStore";
import NewsTodayModal from "../modal/NewsTodayModal";
import CloseOutModal from "../modal/CloseOutModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getBookingApi } from "../../api/bookingApi";

interface BookingFilters {
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export default function BookingManagementTab() {
  const {
    items,
    total,
    page,
    limit,
    loading,
    filters,
    setFilters,
    fetchBookings,
  } = useBookingStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [closeOutModalOpen, setCloseOutModalOpen] = useState(false);
  const [selectedCloseOut, setSelectedCloseOut] = useState<any>(null);
  const [canSave, setCanSave] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [canNews, setCanNews] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const access = parsed?.state?.user?.access || [];

      // 🔥 cek dulu menu_id 2 (Reservation Calendar)
      const reservationAccess = access.find(
        (item: any) => item.menu_id === 2
      );

      const isReservationNoAccess = reservationAccess?.no_access === true;

      // ✅ menu_id 3 → Booking → butuh view_edit
      const hasCanSave = access.some(
        (item: any) =>
          item.menu_id === 3 &&
          item.no_access === false &&
          item.view_edit === true
      );

      let hasCanClose = false;
      let hasCanNews = false;

      // 🔥 hanya cek kalau menu_id 2 NO ACCESS
      if (isReservationNoAccess) {
        // ✅ menu_id 4 → Close Out
        hasCanClose = access.some(
          (item: any) =>
            item.menu_id === 4 &&
            item.no_access === false
        );

        // ✅ menu_id 5 → News Today
        hasCanNews = access.some(
          (item: any) =>
            item.menu_id === 5 &&
            item.no_access === false
        );
      }

      setCanSave(hasCanSave);
      setCanClose(hasCanClose);
      setCanNews(hasCanNews);

    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  /* ================= FETCH ================= */
  useEffect(() => {
    useBookingStore.setState({
      filters: {
        fromDate: undefined,
        toDate: undefined,
        status: undefined,
        statusDp: undefined,
        search: undefined,
      },
      page: 1,
      limit: 10,
    });
  }, []);


  useEffect(() => {
    fetchBookings(page, limit);
  }, [page, filters]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    setFilters({
      ...filters,
      search: search || undefined,
    });

    useBookingStore.setState({ page: 1 }); // reset ke page 1
  };

  /* ================= EXPORT EXCEL ================= */
  const exportExcel = async () => {
    try {
      let currentPage = 1;
      const allData: any[] = [];

      while (true) {
        const res = await getBookingApi(currentPage, limit, filters as BookingFilters);
        if (!res.data.items.length) break;

        allData.push(...res.data.items);

        if (currentPage >= Math.ceil(res.data.total / limit)) break;
        currentPage++;
      }

      if (!allData.length) {
        alert("No data to export");
        return;
      }

      // Generate worksheet
      const worksheet = XLSX.utils.json_to_sheet(
        allData.map((b) => {
          const dpValues = [
            Number(b.dp1 || 0),
            Number(b.dp2 || 0),
            Number(b.dp3 || 0),
            Number(b.dp4 || 0),
            Number(b.dp5 || 0),
          ];

          const dpDates = [
            { value: Number(b.dp1 || 0), date: b.dateDp1 },
            { value: Number(b.dp2 || 0), date: b.dateDp2 },
            { value: Number(b.dp3 || 0), date: b.dateDp3 },
            { value: Number(b.dp4 || 0), date: b.dateDp4 },
            { value: Number(b.dp5 || 0), date: b.dateDp5 },
          ];

          // 🔥 DP PAID
          const dpPaid = dpValues.reduce((sum, val) => sum + val, 0);

          // 🔥 LAST DP DATE
          const lastDp = dpDates
            .filter((d) => d.value > 0 && d.date)
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

          const lastDpDate = lastDp?.date
            ? new Date(lastDp.date).toISOString().split("T")[0]
            : "-";

          return {
            "Tanggal Acara": b.date,
            Time: b.time,
            Name: b.customer?.fullname,
            Phone: b.customer?.phone,
            Pax: b.totalPax,
            Status: b.status.replace("_", " "),
            BookingCode: b.bookingCode,

            TotalDP: Number(b.totalDp || 0),

            // 🔥 tambahan baru
            DPPaid: dpPaid,
            LastDPDate: lastDpDate,
            StatusDP: b.statusDp?.replace("_", " ") || "-", // 🔥 ini yang ditambah
          };
        })
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, `bookings_${new Date().toISOString()}.xlsx`);
    } catch (err: any) {
      console.error(err);
      alert("Failed to export Excel");
    }
  };

  return (
    <div className="p-4">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between mb-4 border-b pb-4 items-end">
        <div className="flex gap-4 items-start flex-col">

          <div className="flex gap-4">

            {/* From Date */}
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <input
                type="date"
                value={filters.fromDate || ""}
                onChange={(e) =>
                  setFilters({ fromDate: e.target.value || undefined })
                }
                className="w-full rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <input
                type="date"
                value={filters.toDate || ""}
                onChange={(e) =>
                  setFilters({ toDate: e.target.value || undefined })
                }
                className="w-full rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
              />
            </div>

          </div>
          <div className="flex gap-4">
            {/* Status */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({ status: e.target.value || undefined })
                }
                className="w-full rounded-md px-3 py-[.60rem] text-sm border-primary border-2"
              >
                <option value="">All</option>
                <option value="confirm">Confirmed</option>
                <option value="waiting_list">Waiting List</option>
                <option value="cancelled">Cancelled</option>
                <option value="seated">Seated</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">DP Status</label>
              <select
                value={filters.statusDp || ""}
                onChange={(e) =>
                  setFilters({ statusDp: e.target.value || undefined })
                }
                className="w-full rounded-md px-3 py-[.60rem] text-sm border-primary border-2"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Search</label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search name/booking code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-[250px] rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
                />

                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                >
                  Search
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="flex gap-2">


          {canSave && (
            <button
              onClick={() => {
                setSelected(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm"
            >
              Add New Booking
            </button>
          )}

          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            Export Excel
          </button>

          {canNews && (


            <button
              onClick={() => setNewsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              News Today
            </button>
          )}

          {canClose && (


            <button

              onClick={() => {
                setSelectedCloseOut(null);
                setCloseOutModalOpen(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close Out
            </button>
          )}

        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Date / Time</th>
              <th className="p-3">Name</th>
              <th className="p-3">Pax</th>
              <th className="p-3">Status</th>
              <th className="p-3">Booking ID</th>
              <th className="p-3 w-32">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              items.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="p-3">
                    {booking.date}
                    <br />
                    {booking.time}
                  </td>

                  <td className="p-3">{booking.customer?.fullname}</td>

                  <td className="p-3">{booking.totalPax} Guest</td>

                  <td className="p-3 capitalize">
                    {booking.status.replace("_", " ")}
                  </td>

                  <td className="p-3">{booking.bookingCode}</td>

                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelected(booking);
                        setModalOpen(true);
                      }}
                      className="text-primary text-sm"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && !items.length && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No booking found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => useBookingStore.setState({ page: page - 1 })}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => useBookingStore.setState({ page: page + 1 })}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <BookingManagementModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
      <NewsTodayModal
        open={newsModalOpen}
        onClose={() => setNewsModalOpen(false)}
      />

      <CloseOutModal
        open={closeOutModalOpen}
        data={selectedCloseOut}
        onClose={() => {
          setCloseOutModalOpen(false); // refresh calendar
        }}
      />
    </div>
  );
}
