import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";
import ReservationScheduler from "../components/organisms/ReservationScheduler";
import WaitingList from "../components/organisms/WaitingList";
import BookingManagementModal from "../components/modal/BookingManagementModal";
import SpecialRequestModal from "../components/modal/SpecialRequestModal";
import CloseOutModal from "../components/modal/CloseOutModal";
import NewsTodayModal from "../components/modal/NewsTodayModal";
import { useBookingStore } from "../stores/useBookingStore";
import { useCloseOutStore } from "../stores/useCloseOutStore";

export default function ReservationCalendar() {
  const {
    items,
    closeOuts,
    totalBooking,
    totalPax,
    totalSpent,
    fetchBookings,
    setFilters,
    resetFilters,
  } = useBookingStore();



  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [specialRequestModalOpen, setSpecialRequestModalOpen] = useState(false);
  const { fetchCloseOuts } = useCloseOutStore();

  const [closeOutModalOpen, setCloseOutModalOpen] = useState(false);
  const [selectedCloseOut, setSelectedCloseOut] = useState<any>(null);

  const { bookingCode } = useParams();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };



  useEffect(() => {
    const today = new Date();
    const formatted = formatDate(today);

    resetFilters();

    setFilters({
      fromDate: formatted,
      toDate: formatted,
    });

    fetchBookings(1, 100);
    fetchCloseOuts(1, 100);
  }, []);



  const handleDateChange = (start: Date, end: Date) => {
    const fromDate = formatDate(end);
    const toDate = formatDate(end);
    console.log(start)
    setFilters({ fromDate, toDate });

    // fetch pakai filter terbaru
    fetchBookings(1, 100);
  };


  /* ================= HELPER PARSE TIME ================= */
  const parseDateTime = (dateStr: string, timeStr?: string): Date | null => {
    if (!dateStr || !timeStr) return null;

    let hours = 0;
    let minutes = 0;

    const upper = timeStr.toUpperCase().trim();

    // FORMAT 12 JAM
    if (upper.includes("AM") || upper.includes("PM")) {
      const [time, modifier] = upper.split(" ");
      [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    } else {
      // FORMAT 24 JAM
      [hours, minutes] = upper.split(":").map(Number);
    }

    const date = new Date(dateStr);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };

  const getStayDuration = () => {
    try {
      const setting = localStorage.getItem("layout");
      if (!setting) return 120;

      const parsed = JSON.parse(setting);
      return parsed.stayDuration || 120;
    } catch {
      return 120;
    }
  };

  const roundToNext15Minutes = (date: Date) => {
    const minutes = date.getMinutes();
    const remainder = minutes % 15;

    if (remainder !== 0) {
      date.setMinutes(minutes + (15 - remainder));
    }

    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };
  const getBookingEndTime = (booking: any, start: Date | null): Date | null => {
    if (!start) return null;

    let end: Date | null = null;

    // PRIORITY 1 → leaveTime
    if (booking.leaveTime) {
      end = parseDateTime(booking.date, booking.leaveTime);
    }

    // PRIORITY 2 → expectedLeaveTime
    if (!end && booking.expectedLeaveTime) {
      end = parseDateTime(booking.date, booking.expectedLeaveTime);
    }

    // PRIORITY 3 → stayDuration
    if (!end) {
      const stayDuration = getStayDuration();
      end = new Date(start.getTime() + stayDuration * 60000);
    }

    if (!end) return null;

    // 🔥 ROUND ke kelipatan 15 menit
    end = roundToNext15Minutes(end);

    // kalau somehow end < start → anggap besok
    if (end && end < start) {
      const diffHours = (start.getTime() - end.getTime()) / 3600000;

      // kalau selisihnya lebih dari 6 jam, anggap data salah
      if (diffHours > 6) {
        console.warn("Invalid leaveTime detected, fallback to stayDuration");
        return new Date(start.getTime() + getStayDuration() * 60000);
      }

      // kalau memang lewat tengah malam (selisih kecil)
      end.setDate(end.getDate() + 1);
    }

    return end;
  };


  /* ================= MAPPING API ================= */
  useEffect(() => {
    const waiting = items
      ?.filter((b: any) => b.status === "waiting_list")
      .map((b: any) => ({
        ...b,
        bookingId: b.id,
        name: b.customer?.fullname,
        pax: b.totalPax,
        tableIds: b.table?.id,
        tableNumber: b.table?.number,
        customerId: b.customer?.id,
        menus: b.bookingMenus || [],
        endOffsetMinutes: 120,
      })) || [];

    const calendarBookings = items
      ?.filter((b: any) =>
        ["waiting_list", "confirm", "seated", "completed"].includes(b.status)
      )
      ?.flatMap((b: any) => {
        const start = parseDateTime(b.date, b.time);
        if (!start) return [];

        const end = getBookingEndTime(b, start);
        if (!end) return [];

        let backgroundColor = "#3b82f6";
        if (b.status === "waiting_list") backgroundColor = "#f1c40f";
        if (b.status === "seated") backgroundColor = "#16a34a";
        if (b.status === "completed") backgroundColor = "#9ca3af";

        const isEditable =
          b.status === "confirm" || b.status === "seated" || b.status === "waiting_list";

        const tables = b.tables?.length
          ? b.tables
          : b.table
            ? [b.table]
            : [];
        let dpIcon = "";

        if (b.needDp) {
          if (b.downpaymentProof) {
            dpIcon = "paid";
          } else {
            dpIcon = "unpaid";
          }
        }


        return {
          id: b.id.toString(),
          classNames: [`booking-${b.id}`],

          title: b.customer?.fullname,

          start,
          end,
          resourceIds: tables.map((t: any) => t.id.toString()),

          backgroundColor,

          editable: isEditable,
          startEditable: isEditable,
          durationEditable: isEditable,

          resourceEditable: true,

          extendedProps: {
            bookingId: b.id,
            tables: tables,
            categoryId: b.category?.id,
            category: b.category,
            customer: b.customer,
            status: b.status,
            totalPax: b.totalPax,
            dpStatus: dpIcon,
          },
        };
      }) || [];

    /* ================= MAPPING CLOSE OUT ================= */

    const closeOutEvents =
      closeOuts?.flatMap((c: any, index: number) => {
        const startDate = new Date(c.fromDate);
        const endDate = new Date(c.toDate);

        const events: any[] = [];

        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const start = parseDateTime(
            d.toISOString().split("T")[0],
            c.fromTime
          );

          const end = parseDateTime(
            d.toISOString().split("T")[0],
            c.untilTime
          );

          if (!start || !end) continue;

          events.push({
            id: `closeout-${index}-${d.toISOString()}`,
            start,
            end,

            // 🔥 BLOCK PER TABLE
            resourceIds: c.tableIds.map((id: number) =>
              id.toString()
            ),

            display: "background",
            backgroundColor: "red",
            overlap: false,
            editable: false,
            extendedProps: {
              type: "closeout",
            },
          });
        }

        return events;
      }) || [];



    setWaitingList(waiting);
    setEvents([...calendarBookings, ...closeOutEvents]);

  }, [items, closeOuts]);


  useEffect(() => {
    if (!items?.length || !bookingCode) return;

    const booking = items.find((b: any) => b.bookingCode === bookingCode);
    if (booking) {
      setSelectedData(booking);
      setModalOpen(true);
    }
  }, [items, bookingCode]);



  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-[#EAEAEA] p-4 flex gap-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden">
            <div className="m-4 flex items-center justify-between shrink-0">
              <h1 className="text-2xl font-bold">
                Reservation Calendar
              </h1>
            </div>

            <div className="flex justify-between mx-4 items-end">
              <div className="flex gap-4">
                <p>Bookings : <b>{totalBooking}</b></p>
                <p>Pax : <b>{totalPax}</b></p>
                <p>Spend : <b>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(totalSpent)}
                </b></p>

              </div>



            </div>
            <div className="flex gap-2 mx-4 my-4 justify-end">
              <button
                onClick={() => {
                  setSelectedData({
                    status: "waiting_list",
                  });
                  setModalOpen(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition"
              >
                Book
              </button>

              <button
                onClick={() => {
                  setSelectedData({
                    status: "confirm",
                  });
                  setModalOpen(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Walk In
              </button>
              <button
                onClick={() => {
                  setSelectedCloseOut(null);
                  setCloseOutModalOpen(true);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close Out
              </button>
              <button
                onClick={() => setNewsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                News Today
              </button>
              <button
                onClick={() => setSpecialRequestModalOpen(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Special Request
              </button>
            </div>


            <div className="flex-1 overflow-auto min-w-0">
              <ReservationScheduler
                onDateChange={handleDateChange}
                events={events}
                onSelectSlot={(data) => {
                  setSelectedData(data);

                  setSelectedData({
                    status: "confirm",
                  });
                  setModalOpen(true);
                }}
                onSelectEvent={(data) => {
                  const booking = items.find(
                    (b: any) => b.id === data.bookingId
                  );

                  setSelectedData(booking);
                  setModalOpen(true);
                }}
                onDropFromWaiting={(data) => {
                  setSelectedData(data);
                  setModalOpen(true);
                }}
              />
            </div>
          </div>

          <WaitingList
            data={waitingList}
            onClick={(item: any) => {
              setSelectedData(item);
              setModalOpen(true);
            }}
          />

          <BookingManagementModal
            open={modalOpen}
            data={selectedData}
            onClose={() => setModalOpen(false)}
          />
          <CloseOutModal
            open={closeOutModalOpen}
            data={selectedCloseOut}
            onClose={() => {
              setCloseOutModalOpen(false);
              fetchCloseOuts(1, 100); // refresh calendar
            }}
          />
          <NewsTodayModal
            open={newsModalOpen}
            onClose={() => setNewsModalOpen(false)}
          />
          <SpecialRequestModal
            open={specialRequestModalOpen}
            onClose={() => setSpecialRequestModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
