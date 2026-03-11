import { useEffect, useState } from "react";
import BookingManagementModal from "../modal/BookingManagementModal";
import { useBookingStore } from "../../stores/useBookingStore";
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
        allData.map((b) => ({
          Date: b.date,
          Time: b.time,
          Name: b.customer?.fullname,
          Pax: b.totalPax,
          Status: b.status.replace("_", " "),
          BookingID: b.bookingCode,
        }))
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
          <button
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            Add New Booking
          </button>

          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            Export Excel
          </button>
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
    </div>
  );
}
