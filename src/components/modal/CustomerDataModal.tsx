import { useEffect, useState } from "react";
import { useCustomerStore } from "../../stores/useCustomerStore";
import CustomerDataBookingModal from "./CustomerDataBookingModal";

const PAGE_SIZE = 3;

export default function CustomerDataModal({ open, data, onClose }: any) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const {
    bookingItems,
    bookingTotal,
    bookingPage,
    bookingLimit,
    fetchCustomerBookings,
    bookingLoading,
  } = useCustomerStore();

  useEffect(() => {
    if (open && data?.id) {
      fetchCustomerBookings(data.id, 1, PAGE_SIZE);
    }
  }, [open, data]);

  if (!open) return null;

  const totalPages = Math.ceil(bookingTotal / bookingLimit);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[900px] rounded-lg p-5">
        <h3 className="font-semibold mb-4 text-lg">
          Customer Visit History
        </h3>

        {/* CUSTOMER INFO */}
        {data && (
          <div className="mb-4 text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {data.fullname}</p>
            <p><span className="font-medium">Email:</span> {data.email}</p>
            <p><span className="font-medium">Phone:</span> {data.phone}</p>
            <p><span className="font-medium">Instagram:</span> {data.instagram}</p>
            <p><span className="font-medium">Visit Time:</span> {data.visit_time} Times</p>
          </div>
        )}

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3 w-12">No</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                {/* <th className="p-3">Table</th> */}
                <th className="p-3">Pax</th>
                <th className="p-3">Status</th>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookingLoading && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}

              {!bookingLoading && bookingItems.length > 0 ? (
                bookingItems.map((booking, index) => (
                  <tr key={booking.id} className="border-t">
                    <td className="p-3">
                      {(bookingPage - 1) * bookingLimit + index + 1}
                    </td>
                    <td className="p-3">{booking.date}</td>
                    <td className="p-3">{booking.time}</td>
                    {/* <td className="p-3">
                      {booking.table?.number || "-"}
                    </td> */}
                    <td className="p-3">{booking.totalPax} Guest</td>
                    <td className="p-3 capitalize">
                      {booking.status.replace("_", " ")}
                    </td>
                    <td className="p-3">{booking.bookingCode}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setOpenBookingModal(true);
                        }}
                        className="px-3 py-1 text-xs bg-primary text-white rounded"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !bookingLoading && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      No visit history
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-gray-500">
              Page {bookingPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={bookingPage === 1}
                onClick={() =>
                  fetchCustomerBookings(
                    data.id,
                    bookingPage - 1,
                    bookingLimit
                  )
                }
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              <button
                disabled={bookingPage === totalPages}
                onClick={() =>
                  fetchCustomerBookings(
                    data.id,
                    bookingPage + 1,
                    bookingLimit
                  )
                }
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ACTION */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Close
          </button>
        </div>
        <CustomerDataBookingModal
          open={openBookingModal}
          data={selectedBooking}
          onClose={() => {
            setOpenBookingModal(false);
            setSelectedBooking(null);
          }}
        />

      </div>
    </div>
  );
}
