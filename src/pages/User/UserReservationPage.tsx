import { useEffect, useState, useMemo } from "react";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";
import { useNavigate } from "react-router-dom";


export default function UserReservationPage() {
    const {
        data,
        fetchReservationStyle,
        fetchAvailableTimeSlots,
        availableTimeSlots,
        fetchAvailableTableCategories,
        availableTableCategories,
        fetchTableAvailability,
        resetTableAvailability,
        loadingTableAvailability,
        tableAvailability
    } = useReservationStore();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [time, setTime] = useState<number | null>(null);
    const [selectedTableCategory, setSelectedTableCategory] = useState<number | null>(null);
    const [isRestoring, setIsRestoring] = useState(true);
    const [guest, setGuest] = useState<number>(1);
    const [customGuest, setCustomGuest] = useState<string>("");


    useEffect(() => {

        fetchAvailableTableCategories();

        // Reset hanya kalau bukan dari restore
        if (!isRestoring) {
            setSelectedTableCategory(null);
        }

    }, []);



    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_2");

        if (!raw) return;

        try {
            const saved = JSON.parse(raw);

            if (typeof saved.totalPax === "number") {
                if (saved.totalPax > 10) {
                    setCustomGuest(String(saved.totalPax));
                    setGuest(1);
                } else {
                    setGuest(saved.totalPax);
                    setCustomGuest("");
                }
            }
        } catch (err) {
            console.error("Failed to parse reservation_step_2", err);
        }
    }, []);


    const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    const totalGuest =
        customGuest && Number(customGuest) > 10
            ? Number(customGuest)
            : guest;

    const convertToDecimal = (time24: string) => {
        const [hours, minutes] = time24.split(":").map(Number);
        return hours + minutes / 60;
    };

    const formatTime24 = (t: number) => {
        const hour = Math.floor(t);
        const minutes = Math.round((t - hour) * 60);

        return `${hour.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    };

    const decimalSlots = useMemo(() => {
        return availableTimeSlots.map(convertToDecimal);
    }, [availableTimeSlots]);

    const minTime = decimalSlots.length ? decimalSlots[0] : 0;
    const maxTime = decimalSlots.length
        ? decimalSlots[decimalSlots.length - 1]
        : 0;

    useEffect(() => {
        if (!decimalSlots.length) return;

        // Kalau belum ada time sama sekali
        if (time === null) {
            setTime(minTime);
        }
    }, [decimalSlots]);

    useEffect(() => {
        if (!selectedDate || time === null || !selectedTableCategory) return;
        const formatDateLocal = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        const formattedDate = formatDateLocal(selectedDate);
        const formattedTime = formatTime24(time);

        fetchTableAvailability(
            formattedDate,
            formattedTime,
            totalGuest,
            selectedTableCategory
        );

    }, [selectedDate, time, totalGuest, selectedTableCategory]);

    const getNearestSlot = (value: number) => {
        if (!decimalSlots.length) return value;

        return decimalSlots.reduce((prev, curr) =>
            Math.abs(curr - value) < Math.abs(prev - value)
                ? curr
                : prev
        );
    };

    const today = new Date();

    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const dates: Date[] = useMemo(() => {
        const result: Date[] = [];

        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(selectedYear, selectedMonth + 1, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const current = new Date(d);
            current.setHours(0, 0, 0, 0);

            // skip kalau tanggal sudah lewat
            if (current < today) continue;

            result.push(current);
        }

        return result;
    }, [selectedMonth, selectedYear]);


    const gapRanges = useMemo(() => {
        if (decimalSlots.length < 2) return [];

        const gaps: { start: number; end: number }[] = [];

        for (let i = 0; i < decimalSlots.length - 1; i++) {
            const current = decimalSlots[i];
            const next = decimalSlots[i + 1];

            // kalau selisih lebih dari 15 menit (0.25)
            if (next - current > 0.25) {
                gaps.push({
                    start: current,
                    end: next,
                });
            }
        }

        return gaps;
    }, [decimalSlots]);


    const tableState = useMemo(() => {
        if (!tableAvailability.length) return "empty";

        const item = tableAvailability[0]; // karena biasanya 1 category

        if (item.closeOut && !item.available) return "closed";
        if (!item.closeOut && item.available) return "available";
        if (!item.closeOut && !item.available) return "waiting";

        return "empty";
    }, [tableAvailability]);

    const sliderBackground = useMemo(() => {
        if (!decimalSlots.length) return "";

        const totalRange = maxTime - minTime;

        const segments: string[] = [];

        let lastPosition = minTime;

        gapRanges.forEach((gap) => {
            const startPercent =
                ((gap.start - minTime) / totalRange) * 100;
            const endPercent =
                ((gap.end - minTime) / totalRange) * 100;

            // available part (hijau)
            segments.push(
                `var(--color-primary) ${((lastPosition - minTime) / totalRange) * 100}%`,
                `var(--color-primary) ${startPercent}%`
            );

            // gap part (merah)
            segments.push(
                `#ef4444 ${startPercent}%`,
                `#ef4444 ${endPercent}%`
            );

            lastPosition = gap.end;
        });

        // terakhir hijau lagi
        segments.push(
            `var(--color-primary) ${((lastPosition - minTime) / totalRange) * 100}%`,
            `var(--color-primary) 100%`
        );

        return `linear-gradient(to right, ${segments.join(",")})`;
    }, [gapRanges, minTime, maxTime]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchReservationStyle();
    }, []);

    /* ================= GET LAYOUT FROM LOCAL STORAGE ================= */
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const formatted = formatDateLocal(selectedDate);
        fetchAvailableTimeSlots(formatted);
    }, [selectedDate]);




    /* ================= ENSURE TIME VALID ================= */


    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_1");

        if (!raw) {
            setIsRestoring(false);
            return;
        }

        try {
            const saved = JSON.parse(raw);

            if (saved.date) {
                setSelectedDate(new Date(saved.date));
            }

            if (typeof saved.timeBullet === "number") {
                setTime(saved.timeBullet);
            }

            if (saved.categoryId) {
                setSelectedTableCategory(saved.categoryId);
            }

        } catch (err) {
            console.error("Failed to parse reservation_step_1", err);
        } finally {
            setIsRestoring(false);
        }
    }, []);

    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_1");

        if (!raw) {
            setIsRestoring(false);
            return;
        }

        try {
            const saved = JSON.parse(raw);

            if (saved.selectedYear !== undefined) {
                setSelectedYear(saved.selectedYear);
            }

            if (saved.selectedMonth !== undefined) {
                setSelectedMonth(saved.selectedMonth);
            }

            if (saved.date) {
                setSelectedDate(new Date(saved.date));
            }

            if (typeof saved.timeBullet === "number") {
                setTime(saved.timeBullet);
            }

            if (saved.categoryId) {
                setSelectedTableCategory(saved.categoryId);
            }

        } catch (err) {
            console.error("Failed to parse reservation_step_1", err);
        } finally {
            setIsRestoring(false);
        }
    }, []);


    if (!data) return null;

    const logoUrl = data.logo
        ? `${data.logo}`
        : "https://dummyimage.com/200x200/000/fff";

    /* ===== DATE LIST ===== */



    const canProceed = tableState === "available" || tableState === "waiting";



    const handleNext = () => {
        resetTableAvailability();
        const formattedDate = formatDateLocal(selectedDate);

        const payload1 = {
            date: formattedDate,
            time: formatTime24(time ?? minTime),
            timeBullet: time,
            categoryId: selectedTableCategory,
            selectedYear,
            selectedMonth,
        };

        const payload2 = {
            date: formattedDate,
            time: formatTime24(time ?? minTime),
            timeBullet: time,
            categoryId: selectedTableCategory,
            selectedYear,
            selectedMonth,
            totalPax: totalGuest,
        };

        localStorage.setItem(
            "reservation_step_1",
            JSON.stringify(payload1)
        );

        localStorage.setItem(
            "reservation_step_2",
            JSON.stringify(payload2)
        );

        navigate("/state/reservation/step-4");
    };

    const handleNextOrder = () => {
        resetTableAvailability();
        const formattedDate = formatDateLocal(selectedDate);

        const payload1 = {
            date: formattedDate,
            time: formatTime24(time ?? minTime),
            timeBullet: time,
            categoryId: selectedTableCategory,
            selectedYear,
            selectedMonth,
        };

        const payload2 = {
            date: formattedDate,
            time: formatTime24(time ?? minTime),
            timeBullet: time,
            categoryId: selectedTableCategory,
            selectedYear,
            selectedMonth,
            totalPax: totalGuest,
        };

        localStorage.setItem(
            "reservation_step_1",
            JSON.stringify(payload1)
        );

        localStorage.setItem(
            "reservation_step_2",
            JSON.stringify(payload2)
        );

        navigate("/state/reservation/step-3-order");
    };



    return (
        <div className="relative h-screen font-montserrat text-white overflow-hidden">

            {/* BACKGROUND */}
            <img
                src={data.backgroundImage || bgImage}
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/70" />

            {/* CONTENT */}
            <div className="relative z-10 max-w-md w-full md:w-[28rem] md:justify-self-center">

                {/* ================= HEADER ================= */}
                <div className="sticky top-0 z-30 bg-transparent backdrop-blur px-6 pt-6 pb-4">

                    {/* logo millbook kanan atas */}
                    <img
                        src={logoMillbook}
                        className="absolute rounded-full top-6 right-6 h-6"
                    />

                    {/* row utama */}
                    <div className="flex items-center gap-4">
                        <img
                            src={logoUrl}
                            className="w-14 h-14 rounded-full border object-cover"
                        />

                        <h1 className="text-lg font-semibold flex-1 truncate">
                            {data.name}
                        </h1>
                    </div>

                    {/* progress bar */}
                    <div className="mt-4">
                        <div className="h-1 w-full bg-white/20 rounded-full">
                            <div
                                className="h-1 rounded-full"
                                style={{
                                    width: "33%",
                                    background: "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">

                    {/* ================= DATE ================= */}
                    <div className="mt-8 px-6">
                        <p className="text-sm mb-3">Date</p>

                        <div className="flex gap-3 mb-4">
                            {/* Month */}
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="p-2 rounded text-black"
                            >
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const currentYear = today.getFullYear();
                                    const currentMonth = today.getMonth();

                                    if (selectedYear === currentYear && i < currentMonth) return null;

                                    return (
                                        <option key={i} value={i}>
                                            {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Year */}
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="p-2 rounded text-black"
                            >
                                {Array.from({ length: 2 }).map((_, i) => {
                                    const year = today.getFullYear() + i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-4">
                            {dates.map((date, idx) => {
                                const isActive =
                                    date.toDateString() === selectedDate.toDateString();

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        className={`min-w-[100px] min-h-[100px] md:min-w-[120px] md:min-h-[120px] px-3 py-3 rounded-lg text-sm text-center hover:border-primary focus:outline-none ${isActive
                                            ? "text-white"
                                            : "bg-white text-black"
                                            }`}
                                        style={{
                                            background: isActive
                                                ? "var(--color-primary)"
                                                : undefined,
                                        }}
                                    >
                                        <div className="font-semibold">
                                            {date.toLocaleDateString("en-US", {
                                                month: "long",
                                            })}
                                        </div>
                                        <div className="font-semibold">
                                            {date.toLocaleDateString("en-US", {
                                                day: "numeric",
                                            })}
                                        </div>
                                        <div className="text-xs">
                                            {date.toLocaleDateString("en-US", {
                                                weekday: "long",
                                            })}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ================= TIME ================= */}
                    <div className="mt-6 px-6">
                        <p className="text-sm mb-3">Time</p>

                        {decimalSlots.length === 0 ? (
                            <p className="text-sm text-gray-300">No available time slots</p>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-sm mb-2 text-white">
                                    {formatTime24(time ?? minTime)}
                                </span>

                                <input
                                    type="range"
                                    min={minTime}
                                    max={maxTime}
                                    step={0.25}
                                    value={time ?? minTime}
                                    onChange={(e) => {
                                        const rawValue = Number(e.target.value);
                                        const snapped = getNearestSlot(rawValue);
                                        setTime(snapped);
                                    }}
                                    className="w-full custom-range"
                                    style={{
                                        background: sliderBackground,
                                    }}
                                />

                                <div className="flex justify-between w-full text-xs mt-1">
                                    <span className="text-white">
                                        {availableTimeSlots[0]}
                                    </span>
                                    <span className="text-white">
                                        {availableTimeSlots[availableTimeSlots.length - 1]}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* ================= GUEST ================= */}
                    <div className="mt-8 px-6">
                        <p className="text-sm mb-4">How many Guests? ( If Take away pls choose 1 Only)</p>

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {guestOptions.map((num) => {
                                const isActive = !customGuest && guest === num;

                                return (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setGuest(num);
                                            setCustomGuest("");
                                        }}
                                        className={`
            min-w-[60px] h-14 px-4 rounded-lg font-semibold flex-shrink-0
            ${isActive ? "text-white" : "bg-white text-black border"}
          `}
                                        style={{
                                            background: isActive ? "var(--color-primary)" : undefined,
                                        }}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ================= CUSTOM ================= */}
                    <div className="mt-6 px-6">
                        <p className="text-sm mb-2">Custom Guest Number</p>

                        <input
                            type="number"
                            min={11}
                            placeholder="More than 10"
                            value={customGuest}
                            onChange={(e) => setCustomGuest(e.target.value)}
                            className="w-full text-center py-3 rounded-lg !bg-white text-black font-semibold outline-none"
                        />
                    </div>

                    {/* ================= TOTAL ================= */}
                    <div className="mt-6 px-6 hidden">
                        <p className="text-sm mb-2">Total Guest</p>

                        <div
                            className="bg-white rounded-xl py-4 text-center font-semibold text-lg"
                            style={{ color: "var(--color-primary)" }}
                        >
                            {totalGuest} Guests
                        </div>
                    </div>

                    {/* ================= TABLE CATEGORY ================= */}
                    <div className="mt-6 px-6">
                        <p className="text-sm mb-3">Table Category</p>

                        {availableTableCategories.length === 0 ? (

                            <select disabled
                                value={selectedTableCategory ?? ""}
                                onChange={(e) =>
                                    setSelectedTableCategory(Number(e.target.value))
                                }
                                className="w-full p-3 rounded-lg text-black"
                            >
                                <option value="" disabled>
                                    Select table category
                                </option>

                                {availableTableCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                value={selectedTableCategory ?? ""}
                                onChange={(e) =>
                                    setSelectedTableCategory(Number(e.target.value))
                                }
                                className="w-full p-3 rounded-lg text-black"
                            >
                                <option value="" disabled>
                                    Select table category
                                </option>

                                {availableTableCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* ================= TABLE AVAILABILITY INFO ================= */}
                    <div className="mt-4 px-6">
                        {/* LOADING */}
                        {loadingTableAvailability && (
                            <div className="rounded-xl p-4 text-sm bg-gray-500 text-white animate-pulse">
                                Checking table availability...
                            </div>
                        )}

                        {/* DATA */}
                        {!loadingTableAvailability &&
                            tableAvailability.length > 0 &&
                            tableAvailability.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl p-4 text-sm"
                                    style={{
                                        background:
                                            item.closeOut && !item.available
                                                ? "#6b7280" // abu (closed)
                                                : item.available
                                                    ? "#16a34a" // hijau
                                                    : "#f59e0b", // kuning (waiting)

                                        color: "white"
                                    }}
                                >
                                    <p className="font-semibold mb-1">
                                        {item.categoryName}
                                    </p>

                                    <p>
                                        {item.closeOut && !item.available && "Not Available"}

                                        {!item.closeOut && item.available &&
                                            `Available (Max Pax: ${item.availablePax})`}

                                        {!item.closeOut && !item.available &&
                                            "Full booked - You will be added to waiting list"}
                                    </p>

                                    <p>
                                        {item.closeOut && !item.available && "Closest Available Time"}
                                    </p>
                                    <p className="my-4">
                                        {!item.closeOut && !item.available && (
                                            <>
                                                Queue Status: There is currently <b>{item.waitingListCount}</b> person ahead of you.
                                            </>
                                        )}
                                    </p>

                                    <p>
                                        {!item.closeOut && !item.available && "Closest Available Time"}
                                    </p>

                                    {!item.available && item.alternativeText && (
                                        <ul className="mt-2 text-xs opacity-90 list-disc pl-4 space-y-1">
                                            {item.alternativeText
                                                .split("|")
                                                .map((alt: string, i: number) => (
                                                    <li key={i}>{alt.trim()}</li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            ))}

                        {/* EMPTY */}
                        {!loadingTableAvailability &&
                            tableAvailability.length === 0 &&
                            selectedTableCategory && (
                                <div className="rounded-xl p-4 text-sm bg-gray-400 text-white">
                                    No availability data
                                </div>
                            )}
                    </div>

                    {/* ================= SUMMARY ================= */}
                    <div className="mt-6 px-6">
                        <p className="text-sm mb-2">Booking Date & Time</p>

                        <div className="bg-white rounded-xl p-4 text-center font-semibold"
                            style={{ color: "var(--color-primary)" }}>
                            {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                            <br />
                            {formatTime24(time ?? minTime)}
                        </div>
                    </div>

                    {/* ================= ACTION ================= */}
                    <div className="px-6 mt-6 space-y-3 pb-10">

                        <button
                            onClick={handleNextOrder}
                            disabled={!selectedTableCategory || !canProceed}
                            className="w-full py-3 rounded-lg font-semibold transition-all border hover:text-primary hover:border-primary border-primary text-primary bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Order Menu Now
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!selectedTableCategory || !canProceed}
                            className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "var(--color-primary)" }}
                        >
                            Next
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("reservation_step_1");
                                navigate("/state/reservation");
                                resetTableAvailability();
                            }}
                            className="w-full py-3 rounded-lg bg-gray-300 text-gray-700 hover:text-gray-700"
                        >
                            Back
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
