import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import { useBookingStore } from "../../stores/useBookingStore";
import { useEffect, useMemo, useRef } from "react";
import { useTableNumberStore } from "../../stores/useTableNumberStore";

export default function ReservationScheduler({
    events,
    onSelectSlot,
    onSelectEvent,
    // onDropFromWaiting,
    onDateChange, // ✅ tambah ini
    canSave,
}: {
    events: any[];
    onSelectSlot: (data: any) => void;
    onSelectEvent: (data: any) => void;
    onDropFromWaiting: (data: any) => void;
    onDateChange: (start: Date, end: Date) => void;
    canSave: boolean; // 🔥 TAMBAH
}) {
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const calendarRef = useRef<FullCalendar | null>(null);

    const { updateBooking, closeOuts } = useBookingStore();

    const { items: tableItems, fetchTableNumbers } = useTableNumberStore();

    const isOverlappingCloseOut = (
        start: Date,
        end: Date,
        resourceId: string
    ) => {
        if (!closeOuts?.length) return false;

        const selectedDate = start.toISOString().split("T")[0];

        return closeOuts.some((c: any) => {
            // cek tanggal masuk range
            if (selectedDate < c.fromDate || selectedDate > c.toDate) {
                return false;
            }

            // cek table termasuk
            if (!c.tableIds.includes(Number(resourceId))) {
                return false;
            }

            // buat jam closeout
            const closeStart = new Date(`${selectedDate}T${c.fromTime}`);
            const closeEnd = new Date(`${selectedDate}T${c.untilTime}`);

            // cek overlap waktu
            return start < closeEnd && end > closeStart;
        });
    };

    useEffect(() => {
        fetchTableNumbers(1, 100); // ambil semua table
    }, []);
    const removeTooltip = () => {
        if (tooltipRef.current) {
            tooltipRef.current.remove();
            tooltipRef.current = null;
        }
    };
    const resources = useMemo(() => {
        return tableItems.map((table) => ({
            id: table.id.toString(),
            title: table.number,
            extendedProps: {
                tableNumber: table.covers,
                categoryId: table.category?.id,
            },
            category: table.category?.name || "Uncategorized",
        }));
    }, [tableItems]);

    useEffect(() => {
        const timer = setTimeout(() => {
            calendarRef.current?.getApi().updateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [resources]);

    useEffect(() => {
        const handleResize = () => {
            calendarRef.current?.getApi().updateSize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);




    const formatTime24Hour = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    };

    const convertTo24Hour = (timeStr?: string) => {
        if (!timeStr) return "00:00"; // fallback aman

        if (
            !timeStr.toUpperCase().includes("AM") &&
            !timeStr.toUpperCase().includes("PM")
        ) {
            return timeStr.slice(0, 5);
        }

        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    };

    const parseDateTime = (dateStr: string, timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);

        const date = new Date(dateStr);
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);

        return date;
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


    const getDynamicEndTime = (booking: any, start: Date) => {
        let end: Date | null = null;

        if (booking.leaveTime) {
            const time24 = convertTo24Hour(booking.leaveTime);
            end = parseDateTime(booking.date, time24);
        }

        if (!end && booking.expectedLeaveTime) {
            const time24 = convertTo24Hour(booking.expectedLeaveTime);
            end = parseDateTime(booking.date, time24);
        }

        if (!end) {
            const stayDuration = getStayDuration();
            end = new Date(start.getTime() + stayDuration * 60000);
        }

        // 🔥 ROUND KE 15 MENIT
        if (end) {
            end = roundToNext15Minutes(end);
        }

        return end!;
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);
    // hasil: "14:23:45"

    const getStayDuration = () => {
        try {
            const setting = localStorage.getItem("layout");
            if (!setting) return 120; // fallback default 2 jam

            const parsed = JSON.parse(setting);
            return parsed.stayDuration || 120;
        } catch {
            return 120;
        }
    };

    const getRestaurantHours = () => {
        const layoutStr = localStorage.getItem("layout");

        if (!layoutStr)
            return { open: "10:00", close: "22:00" }; // default 24 jam

        try {
            const layout = JSON.parse(layoutStr);
            return {
                open: layout.openHours || "10:00",
                close: layout.closedHours || "22:00",
            };
        } catch {
            return { open: "10:00", close: "22:00" };
        }
    };


    const { open, close } = getRestaurantHours();

    const slotMinTime = `${open}:00`;
    const slotMaxTime = `${close}:00`;



    return (
        <FullCalendar
            key={resources.length}
            ref={calendarRef}
            datesSet={(arg) => {
                onDateChange(arg.start, arg.end);
            }}
            scrollTime={currentTime}
            scrollTimeReset={false}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineDay"
            height="auto"
            contentHeight="100%"

            /** =========================
             *  LEFT: TABLES
             *  ========================= */
            resourceAreaWidth={240}
            resourceAreaHeaderContent="Tables"
            resourceGroupField="category"

            resourceGroupLabelContent={(arg) => (
                <div className="font-semibold text-gray-700 uppercase text-xs py-2">
                    {arg.groupValue}
                </div>
            )}

            resourceLabelContent={(arg) => {
                const covers = arg.resource.extendedProps.tableNumber;

                return (
                    <div className="text-xs leading-tight">
                        <div className="font-medium">
                            Table {arg.resource.title}
                        </div>
                        <div className="text-gray-500">
                            {covers} Pax
                        </div>
                    </div>
                );
            }}

            /** =========================
             *  TOP: TIME (HORIZONTAL)
             *  ========================= */
            slotDuration="00:15:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }}
            titleFormat={{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }}
            slotMinTime={slotMinTime} // dari openHours
            slotMaxTime={slotMaxTime}
            nowIndicator
            editable
            droppable
            selectable
            eventOverlap={false}
            slotEventOverlap={false}
            selectOverlap={false}

            /** =========================
             *  DATA
             *  ========================= */
            resources={resources}



            events={events}
            eventContent={(arg) => {
                const pax = arg.event.extendedProps.totalPax;
                const dpStatus = arg.event.extendedProps.dpStatus;

                return (
                    <div className="flex items-center gap-2 text-xs">
                        {/* BOX PAX */}
                        <span className="px-2 py-0.5 border pax-box border-white bg-white text-black font-semibold">
                            {pax}
                        </span>

                        {/* NAMA */}

                        <div className="flex justify-between items-center text-white w-full text-xs">
                            <span className="truncate text-white">{arg.event.title}</span>

                            {dpStatus === "unpaid" && (
                                <span title="Deposit Required">💵</span>
                            )}

                            {dpStatus === "paid" && (
                                <span title="Deposit Paid">✅</span>
                            )}
                        </div>
                    </div>
                );
            }}
            eventDidMount={(info) => {

                const customer = info.event.extendedProps.customer;
                const pax = info.event.extendedProps.totalPax;
                const status = info.event.extendedProps.status;

                if (!customer) return;

                const showTooltip = () => {
                    removeTooltip(); // 🔥 selalu bersihin dulu

                    const tooltipEl = document.createElement("div");
                    tooltipEl.className =
                        "fixed z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg px-3 py-2 pointer-events-none";

                    tooltipEl.innerHTML = `
            <div class="font-semibold text-sm mb-1">
                ${customer.fullname}
            </div>
            <div>📞 ${customer.phone}</div>
            <div>👥 ${pax} pax</div>
            <div class="mt-2 text-[11px] font-semibold">
            ${status.replace(/_/g, " ").toUpperCase()}
            </div>
                    `;

                    document.body.appendChild(tooltipEl);

                    const rect = info.el.getBoundingClientRect();

                    tooltipEl.style.top =
                        rect.top - tooltipEl.offsetHeight - 8 + "px";
                    tooltipEl.style.left =
                        rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2 + "px";

                    tooltipRef.current = tooltipEl; // 🔥 simpan global
                };

                const hideTooltip = () => {
                    removeTooltip();
                };

                info.el.addEventListener("mouseenter", showTooltip);
                info.el.addEventListener("mouseleave", hideTooltip);
            }}

            /** =========================
             *  INTERACTION
             *  ========================= */
            select={(info) => {
                onSelectSlot({
                    start: info.start,
                    end: info.end,
                    tableIds: info.resource?.id,
                });
            }}

            eventClick={(info) => {
                if (info.event.extendedProps?.type === "closeout") {
                    return; // 🚫 jangan buka modal
                }

                const bookingId = info.event.extendedProps.bookingId;

                onSelectEvent({
                    bookingId,
                });

                removeTooltip();
            }}
            eventDragStart={() => removeTooltip()}

            selectAllow={(info) => {
                const resourceId = info.resource?.id;
                if (!resourceId) return false;

                const blocked = isOverlappingCloseOut(
                    info.start,
                    info.end,
                    resourceId
                );

                return !blocked;
            }}

            eventDrop={async (info) => {
                if (!canSave) {
                    info.revert();
                    return;
                }
                const event = info.event;
                const extended = event.extendedProps;
                const resourceId = event.getResources()[0]?.id;

                if (isOverlappingCloseOut(event.start!, event.end!, resourceId)) {
                    info.revert();
                    return;
                }

                if (!extended || extended.status === "completed") {
                    info.revert();
                    return;
                }

                const tables = extended.tables || [];
                const newResourceId = event.getResources()[0]?.id;
                const oldResourceId = info.oldResource?.id;

                // ==============================
                // 🚫 BLOCK PINDAH MEJA MULTI TABLE
                // ==============================
                if (tables.length > 1 && newResourceId !== oldResourceId) {
                    info.revert();
                    return;
                }

                const start = event.start!;
                const end = event.end!;
                const formattedDate = formatDate(start);
                const formattedTime = formatTime24Hour(start);
                const formattedTimeEnd = formatTime24Hour(end);

                try {
                    const formData = new FormData();
                    formData.append("date", formattedDate);
                    formData.append("time", formattedTime);
                    formData.append("expectedLeaveTime", formattedTimeEnd);
                    const resource = event.getResources()[0];

                    const newCategoryId =
                        resource?.extendedProps?.categoryId || extended.categoryId;

                    if (newCategoryId) {
                        formData.append("categoryId", newCategoryId.toString());
                    }

                    // ==============================
                    // 🔥 KIRIM SEMUA TABLE IDS
                    // ==============================
                    if (tables.length > 1) {
                        tables.forEach((t: any) => {
                            formData.append("tableIds", t.id.toString());
                        });
                    } else if (newResourceId) {
                        formData.append("tableIds", newResourceId);
                    }

                    await updateBooking(extended.bookingId, formData);
                } catch (error) {
                    console.error("Failed move booking:", error);
                    info.revert();
                }

                removeTooltip();
            }}

            eventReceive={async (info) => {
                if (!canSave) {
                    info.revert();
                    return;
                }
                const start = info.event.start!;
                const booking = info.event.extendedProps;

                const end = getDynamicEndTime(booking, start);
                info.event.setEnd(end);

                const resource = info.event.getResources()[0];
                const resourceId = resource?.id;

                if (isOverlappingCloseOut(start, end, resourceId)) {
                    info.event.remove();
                    return;
                }

                const formattedDate = formatDate(start);
                const formattedTime = formatTime24Hour(start);
                const tableIds = resource?.id;
                const customerId = booking.customerId;
                const bookingId = booking.bookingId;

                // 🔥 ambil categoryId dari resource
                const newCategoryId =
                    resource?.extendedProps?.categoryId || booking.categoryId;

                try {
                    const formData = new FormData();
                    formData.append("status", "confirm");
                    formData.append("date", formattedDate);
                    formData.append("time", formattedTime);

                    if (tableIds) formData.append("tableIds", tableIds);
                    if (customerId) formData.append("customerId", String(customerId));

                    // ✅ TAMBAH INI
                    if (newCategoryId) {
                        formData.append("categoryId", newCategoryId.toString());
                    }

                    await updateBooking(bookingId, formData);
                } catch (error) {
                    console.error("Failed update booking:", error);
                    info.event.remove();
                }
            }}


        />
    );
}
