export default function ReservationModal({ open, data, onClose }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Reservation Detail
        </h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Customer Name"
          defaultValue={data?.name}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Pax"
          defaultValue={data?.pax}
        />

        <button
          onClick={onClose}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
