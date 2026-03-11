import { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { Armchair, UserRound, Clock9, BookUser } from "lucide-react";

export default function WaitingList({ data = [], onClick }: any) {
  const ref = useRef<HTMLDivElement>(null);

  /* ================= DRAGGABLE ================= */
  useEffect(() => {
    if (!ref.current) return;
    if ((ref.current as any)._draggable) return;

    (ref.current as any)._draggable = new Draggable(ref.current, {
      itemSelector: ".waiting-item",
      eventData: (el) => {
        const minutes = Number(el.getAttribute("data-offset") || 0);

        return {
          id: el.getAttribute("data-id"),
          title: el.getAttribute("data-name") || "",
          duration: `PT${minutes}M`,
          extendedProps: {
            bookingId: el.getAttribute("data-bookingid"),
            pax: Number(el.getAttribute("data-pax") || 0),
            phone: el.getAttribute("data-phone") || "",
            email: el.getAttribute("data-email") || "",
            instagram: el.getAttribute("data-instagram") || "",
            time: el.getAttribute("data-time") || "",
            channel: el.getAttribute("data-channel") || "",
            category: el.getAttribute("data-category") || "",
            expectedLeaveTime: el.getAttribute("data-expectedLeaveTime") || "",
            date: el.getAttribute("data-date") || "",
            tableIds: JSON.parse(el.getAttribute("data-tableids") || "[]"),
            note: el.getAttribute("data-note") || "",
            status: el.getAttribute("data-status") || "waiting_list",
            dpReceipt: el.getAttribute("data-dpreceipt") || null,
            endOffsetMinutes: minutes,
            customerId: el.getAttribute("data-customerid") || null,
          },
        };
      },
    });
  }, []);

  /* ================= NORMALIZE ================= */
  const handleDetail = (item: any) => {
    const normalized = {
      id: item.id,
      bookingCode: item.bookingCode || item.code || "",
      date: item.date || "",
      time: item.time || "",
      channel: item.channel || "",
      expectedLeaveTime: item.expectedLeaveTime || "",
      totalPax: item.totalPax || item.pax || 0,
      referenceNumber: item.referenceNumber || item.referenceNumber || 0,
      totalDp: item.totalDp || item.totalDp || 0,
      needDp: item.needDp || item.needDp || false,
      note: item.note || "",
      status: item.status || "waiting_list",
      downpaymentProof: item.downpaymentProof || null,


  category: item.category
    ? typeof item.category === "object"
      ? item.category
      : { id: item.category }
    : null,

        tables: (item.tables || []).map((t: any) => ({
    id: t.id,
    number: t.number,
    covers: t.covers,
  })),

      customer: {
        id: item.customerId || item.customer?.id || undefined,
        fullname:
          item.customer?.fullname || item.name || "",
        phone:
          item.customer?.phone || item.phone || "",
        email:
          item.customer?.email || item.email || "",
        instagram:
          item.customer?.instagram || item.instagram || "",
      },

      bookingMenus:
        (item.bookingMenus || item.menus || []).map((m: any) => ({
          menu: {
            id: m.menu?.id || m.id,
            name: m.menu?.name || m.name,
            price: m.menu?.price || m.price,
            photo: m.menu?.photo || m.photo,
            description: m.menu?.description || m.description,
          },
          qty: m.qty || 1,
        })) || [],
    };

    onClick(normalized);
  };

  /* ================= RENDER ================= */
  return (
    <div ref={ref} className="w-[350px] bg-white rounded-lg p-4 overflow-y-auto">
      <h3 className="font-semibold mb-3">Waiting List</h3>

      {data.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          No waiting list
        </p>
      )}

      {data.map((item: any) => (
        <div
          key={item.id}
          data-bookingid={item.bookingId || item.id}
          data-id={item.id}
          data-name={item.customer?.fullname || item.name}
          data-pax={item.totalPax || item.pax}
          data-referenceNumber={item.referenceNumber || item.referenceNumber}
          data-totalDp={item.totalDp || item.totalDp}
          data-needDp={item.needDp || item.needDp}
          data-phone={item.customer?.phone || item.phone}
          data-email={item.customer?.email || item.email}
          data-instagram={item.customer?.instagram || item.instagram}
          data-time={item.time}
          data-channel={item.channel}
          data-expectedLeaveTime={item.expectedLeaveTime}
          data-date={item.date}
          data-tableids={JSON.stringify(item.tables?.map((t: { id: any; }) => t.id) || [])}
          data-customerid={item.customerId || item.customer?.id}
          data-category={item.category?.id || item.category || ""}
          data-note={item.note}
          data-status={item.status}
          data-dpreceipt={item.dpReceipt}
          data-offset={item.endOffsetMinutes || 180}
          className="
          
            waiting-item
            cursor-move
            mb-3
            border
            rounded-lg
            p-3
            hover:bg-gray-50
            flex
            items-center
            gap-3
          "
        >
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock9 size={18} className="text-gray-600" />
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">{item.date}</span>
              <span className="text-gray-400">·</span>
              <span className="font-medium">{item.time}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm font-medium">
              <UserRound size={14} className="text-gray-500" />
              {item.customer?.fullname || item.name}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm font-medium">
              <Armchair size={14} />
              <span>{item.totalPax || item.pax} Pax</span>
            </div>
          </div>

          {/* DETAIL BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDetail(item);
            }}
            className="
              w-9 h-9
              rounded-md
              bg-primary
              text-white
              flex
              items-center
              justify-center
              hover:opacity-90
            "
          >
            <BookUser size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
