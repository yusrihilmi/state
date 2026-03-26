import { useEffect, useState } from "react";
import CustomerDataModal from "../modal/CustomerDataModal";
import CustomerFormModal from "../modal/CustomerFormModal";
import { useCustomerStore } from "../../stores/useCustomerStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getCustomerApi } from "../../api/customerApi";


export default function CustomerDataTab() {
  const items = useCustomerStore((s) => s.items);
  const total = useCustomerStore((s) => s.total);
  const page = useCustomerStore((s) => s.page);
  const limit = useCustomerStore((s) => s.limit);
  const listLoading = useCustomerStore((s) => s.listLoading);
  const filters = useCustomerStore((s) => s.filters);
  const setFilters = useCustomerStore((s) => s.setFilters);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);

  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [role, setRole] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const userRole = parsed?.state?.user?.role;

      setRole(userRole);
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchCustomers(page, limit);
  }, [page, filters.search, filters.fromDate, filters.toDate]);


  const exportExcel = async () => {
    try {
      let currentPage = 1;
      const allData: any[] = [];

      while (true) {
        // 🔥 Gunakan filter aktif
        const res = await getCustomerApi(
          currentPage,
          limit,
          filters.search,
          filters.fromDate,
          filters.toDate
        );

        if (!res.data.items.length) break;

        allData.push(...res.data.items);

        // Stop jika sudah halaman terakhir
        if (currentPage >= Math.ceil(res.data.total / limit)) break;
        currentPage++;
      }

      if (!allData.length) {
        alert("No data to export");
        return;
      }

      // Generate worksheet
      const worksheet = XLSX.utils.json_to_sheet(
        allData.map((c) => ({
          Name: c.fullname,
          Phone: c.phone,
          Email: c.email,
          Instagram: c.instagram,
          VisitTime: c.visit_time ?? 0,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, `customers_${new Date().toISOString()}.xlsx`);
    } catch (err: any) {
      console.error(err);
      alert("Failed to export Excel");
    }
  };
  const allowedRoles = [1, 2, 6];
  const canSave = role !== null && allowedRoles.includes(role);

  return (
    <div className="p-4">

      {/* FILTER SECTION */}
      <div className="flex justify-between items-center">

        <div className="flex flex-wrap gap-3 mb-4 items-end">

          {/* SEARCH */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 block">Search</label>
            <input
              type="text"
              placeholder="Search by name"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ search: e.target.value || undefined })
              }
              className="w-full rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
            />
          </div>

          {/* FROM DATE */}
          <div className="flex flex-col">
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

          {/* TO DATE */}
          <div className="flex flex-col">
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

        {/* HEADER */}
        <div className="flex gap-2">


          {canSave && (
            <button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm"
            >
              + Add Customer
            </button>
          )}

          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Instagram</th>
              <th className="p-3">Visit Time</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {!listLoading &&
              items.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="p-3">{customer.fullname}</td>
                  <td className="p-3">{customer.phone}</td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">{customer.instagram}</td>
                  <td className="p-3">{customer.visit_time ?? 0} Times</td>
                  <td className="p-3 flex gap-2 justify-end">
                    <button
                      className="text-primary text-sm"
                      onClick={() => {
                        setSelected(customer);
                        setDetailOpen(true);
                      }}
                    >
                      Detail
                    </button>


                    {canSave && (


                      <button
                        className="text-blue-600 text-sm"
                        onClick={() => {
                          setSelected(customer);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canSave && (



                      <button
                        className="text-red-600 text-sm"
                        onClick={() => setDeleteId(customer.id)}
                      >
                        Delete
                      </button>
                    )}

                  </td>
                </tr>
              ))}

            {!listLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Customer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete customer "
              {items.find(i => i.id === deleteId)?.fullname}"?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteCustomer(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Page {page} of {totalPages || 1}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => fetchCustomers(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchCustomers(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}
      <CustomerDataModal
        open={detailOpen}
        data={selected}
        onClose={() => setDetailOpen(false)}
      />

      <CustomerFormModal
        open={formOpen}
        data={selected}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
