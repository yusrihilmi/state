import { useRef, useState, useEffect } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { useReservationStore } from "../../stores/useReservationStore";
import { Link } from "react-router-dom";
import loginImage from "../../assets/login-image.png";
import logoMillbook from "../../assets/logo-millbook.png";

const DUMMY_IMAGE =
    "https://dummyimage.com/320x240/ccc/fff&text=No+Image";

export default function UserHomePage() {
    const {
        data,
        promotions,
        fetchReservationStyle,
        fetchPromotions,
    } = useReservationStore();

    const [selectedPromo, setSelectedPromo] = useState<any | null>(null);

    useEffect(() => {
        localStorage.removeItem("reservation_step_1");
        localStorage.removeItem("reservation_step_2");
        localStorage.removeItem("reservation_step_3");
        localStorage.removeItem("reservation_step_4");
        localStorage.removeItem("reservation_step_5");
        localStorage.removeItem("reservation_step_6");

        fetchReservationStyle();
        fetchPromotions();
    }, []);

    if (!data) return null;

    const layoutType = data.layout ?? "default";

    const logoUrl =
        data.logo || "https://dummyimage.com/200x200/000/fff";

    const formattedPhone = data.phone
        ?.replace(/\D/g, "") // hapus semua selain angka
        .replace(/^0/, "62");

    return (
        <div className="relative min-h-screen font-montserrat text-white">
            {/* BACKGROUND */}
            <img
                src={data.backgroundImage || loginImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

            <div className="relative z-10 max-w-md w-full md:w-[28rem] md:justify-self-center">
                {layoutType === "custom2" ? (
                    <Custom2Layout
                        data={data}
                        promotions={promotions}
                        selectedPromo={selectedPromo}
                        setSelectedPromo={setSelectedPromo}
                        logoUrl={logoUrl}
                        formattedPhone={formattedPhone}
                    />
                ) : layoutType === "custom3" ? (
                    <Custom3Layout
                        data={data}
                        promotions={promotions}
                        selectedPromo={selectedPromo}
                        setSelectedPromo={setSelectedPromo}
                        logoUrl={logoUrl}
                        formattedPhone={formattedPhone}
                    />
                ) : (
                    <DefaultLayout
                        data={data}
                        promotions={promotions}
                        selectedPromo={selectedPromo}
                        setSelectedPromo={setSelectedPromo}
                        logoUrl={logoUrl}
                        formattedPhone={formattedPhone}
                    />
                )}

            </div>
        </div>
    );
}

function Custom3Layout({
    data,
    promotions,
    selectedPromo,
    setSelectedPromo,
    logoUrl,
    formattedPhone,
}: any) {
    const [isOpenNow, setIsOpenNow] = useState(false);
    useEffect(() => {
        const checkOpenStatus = () => {
            if (!data) return;

            const { openHours, closedHours, status } = data;

            if (status !== "OPEN") {
                setIsOpenNow(false);
                return;
            }

            const parseTime = (timeStr: string) => {
                // timeStr contoh: "09:00 AM"
                const [time, ampm] = timeStr.split(" ");
                let [hours, minutes] = time.split(":").map(Number);
                if (ampm === "PM" && hours !== 12) hours += 12;
                if (ampm === "AM" && hours === 12) hours = 0;
                return hours * 60 + minutes; // total menit sejak midnight
            };

            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const openMinutes = parseTime(openHours);
            const closeMinutes = parseTime(closedHours);

            setIsOpenNow(nowMinutes >= openMinutes && nowMinutes <= closeMinutes);
        };

        checkOpenStatus();
        const interval = setInterval(checkOpenStatus, 60000); // update tiap menit
        return () => clearInterval(interval);
    }, [data]);
    return (
        <>
            <div className="relative px-6 pt-6">
                {/* CALL US TOP RIGHT */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <a
                        href={isOpenNow ? `https://wa.me/${formattedPhone}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-white hover:text-white text-xs px-3 py-1 rounded-full shadow-md transition ${isOpenNow ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isOpenNow ? "Call Us" : "Closed"}
                    </a>

                    <img
                        src={logoMillbook}
                        alt="Millbook"
                        className="h-10 rounded-full object-contain opacity-90"
                    />
                </div>

                {/* HEADER */}
                <div className="flex items-center gap-4 pt-10">
                    <img
                        src={logoUrl}
                        className="w-20 h-20 rounded-full border object-cover"
                    />
                    <h1 className="text-xl font-semibold">{data.name}</h1>
                </div>
            </div>

            {/* CTA */}

            <PromotionSection
                promotions={promotions}
                selectedPromo={selectedPromo}
                setSelectedPromo={setSelectedPromo}
            />
            <div className="px-6">
                {/* {data.status === "OPEN" && isOpenNow ? (
                    <Link
                        to="/state/reservation/step-1"
                        className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                        style={{ background: "var(--color-primary)" }}
                    >
                        Make Reservation or Take Away Here
                    </Link>
                ) : (
                    <div className="block w-full py-3 rounded-md font-semibold text-white text-center bg-gray-400 cursor-not-allowed">
                        Closed ({data.openHours} - {data.closedHours})
                    </div>
                )} */}
                <Link
                    to="/state/reservation/step-1"
                    className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                    style={{ background: "var(--color-primary)" }}
                >
                    Make Reservation or Take Away Here
                </Link> 
                <Link
                    to="/state/reservation/search"
                    className="block w-full mt-4 py-3 rounded-md font-semibold text-white hover:text-white text-center bg-transparent underline"
                >
                    Check Your Booking Status
                </Link>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        data.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-0 gap-1 text-sm mt-6 hover:text-white text-white "
                >
                    <p className="text-sm">
                        {data.address} 📍
                    </p>
                </a>
                <p>{data.email}</p>
                <p>{data.phone}</p>
                <a href={data.website} className=" text-white mt-4 py-1 px-0 rounded-md" target="_blank" rel="noopener noreferrer">{data.website}</a>

            </div>
        </>
    );
}
function Custom2Layout({
    data,
    promotions,
    selectedPromo,
    setSelectedPromo,
    logoUrl,
    formattedPhone,
}: any) {
    const [isOpenNow, setIsOpenNow] = useState(false);
    useEffect(() => {
        const checkOpenStatus = () => {
            if (!data) return;

            const { openHours, closedHours, status } = data;

            if (status !== "OPEN") {
                setIsOpenNow(false);
                return;
            }

            const parseTime = (timeStr: string) => {
                // timeStr contoh: "09:00 AM"
                const [time, ampm] = timeStr.split(" ");
                let [hours, minutes] = time.split(":").map(Number);
                if (ampm === "PM" && hours !== 12) hours += 12;
                if (ampm === "AM" && hours === 12) hours = 0;
                return hours * 60 + minutes; // total menit sejak midnight
            };

            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const openMinutes = parseTime(openHours);
            const closeMinutes = parseTime(closedHours);

            setIsOpenNow(nowMinutes >= openMinutes && nowMinutes <= closeMinutes);
        };

        checkOpenStatus();
        const interval = setInterval(checkOpenStatus, 60000); // update tiap menit
        return () => clearInterval(interval);
    }, [data]);
    return (
        <>
            {/* HEADER CENTER */}
            <div className="pt-16 flex flex-col items-center text-center px-6">
                {/* CALL US TOP RIGHT */}
                <div className="absolute top-6 right-6 flex items-center gap-3">

                    <img
                        src={logoMillbook}
                        alt="Millbook"
                        className="h-10 rounded-full object-contain opacity-90"
                    />
                </div>
                <img
                    src={logoUrl}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h1 className="text-xl font-semibold">{data.name}</h1>

            </div>

            {/* PROMO DULU */}
            <PromotionSection
                promotions={promotions}
                selectedPromo={selectedPromo}
                setSelectedPromo={setSelectedPromo}
            />

            {/* CTA */}
            <div className="px-6 pb-24">
                {/* {data.status === "OPEN" && isOpenNow ? (
                    <Link
                        to="/state/reservation/step-1"
                        className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                        style={{ background: "var(--color-primary)" }}
                    >
                        Make Reservation or Take Away Here
                    </Link>
                ) : (
                    <div className="block w-full py-3 rounded-md font-semibold text-white text-center bg-gray-400 cursor-not-allowed">
                        Closed ({data.openHours} - {data.closedHours})
                    </div>
                )} */}
                <Link
                    to="/state/reservation/step-1"
                    className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                    style={{ background: "var(--color-primary)" }}
                >
                    Make Reservation or Take Away Here
                </Link>
                <Link
                    to="/state/reservation/search"
                    className="block w-full mt-4 py-3 rounded-md font-semibold text-white hover:text-white text-center bg-transparent underline"
                >
                    Check Your Booking Status
                </Link>

                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        data.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-0 gap-1 text-sm mt-8 hover:text-white text-white "
                >
                    <p className="text-sm">
                        {data.address} 📍
                    </p>
                </a>
                <p>{data.email}</p>
                <p>{data.phone}</p>
                <a href={data.website} className="text-white mt-4 py-1 px-0 rounded-md" target="_blank" rel="noopener noreferrer">{data.website} </a>
            </div>

            {/* FLOATING CALL US */}

            <a
                href={isOpenNow ? `https://wa.me/${formattedPhone}` : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg z-50 text-white hover:text-white text-xs  transition ${isOpenNow ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                    }`}
            >
                {isOpenNow ? "Call Us" : "Closed"}
            </a>

        </>
    );
}

function DefaultLayout({
    data,
    promotions,
    selectedPromo,
    setSelectedPromo,
    logoUrl,
    formattedPhone,
}: any) {
    const [isOpenNow, setIsOpenNow] = useState(false);
    useEffect(() => {
        const checkOpenStatus = () => {
            if (!data) return;

            const { openHours, closedHours, status } = data;

            if (status !== "OPEN") {
                setIsOpenNow(false);
                return;
            }

            const parseTime = (timeStr: string) => {
                // timeStr contoh: "09:00 AM"
                const [time, ampm] = timeStr.split(" ");
                let [hours, minutes] = time.split(":").map(Number);
                if (ampm === "PM" && hours !== 12) hours += 12;
                if (ampm === "AM" && hours === 12) hours = 0;
                return hours * 60 + minutes; // total menit sejak midnight
            };

            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const openMinutes = parseTime(openHours);
            const closeMinutes = parseTime(closedHours);

            setIsOpenNow(nowMinutes >= openMinutes && nowMinutes <= closeMinutes);
        };

        checkOpenStatus();
        const interval = setInterval(checkOpenStatus, 60000); // update tiap menit
        return () => clearInterval(interval);
    }, [data]);
    return (
        <>
            <div className="relative px-6 pt-6">
                {/* CALL US TOP RIGHT */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <a
                        href={isOpenNow ? `https://wa.me/${formattedPhone}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-white hover:text-white text-xs px-3 py-1 rounded-full shadow-md transition ${isOpenNow ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isOpenNow ? "Call Us" : "Closed"}
                    </a>

                    <img
                        src={logoMillbook}
                        alt="Millbook"
                        className="h-10 rounded-full object-contain opacity-90"
                    />
                </div>

                {/* HEADER */}
                <div className="flex items-center gap-4 pt-10">
                    <img
                        src={logoUrl}
                        className="w-20 h-20 rounded-full border object-cover"
                    />
                    <h1 className="text-xl font-semibold">{data.name}</h1>
                </div>

                <div className="pt-4">
                    <a
                        href={data.address}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-0 gap-1 text-sm mt-1 hover:text-white text-white "
                    >
                        <p className="text-sm">
                            {data.name} 📍
                        </p>
                    </a>
                    <p>{data.email}</p>
                    <p>{data.phone}</p>
                    <a href={data.website} className="text-white mt-4 py-1 px-0 rounded-md" target="_blank" rel="noopener noreferrer">{data.website} </a>
                </div>
            </div>

            {/* CTA */}
            <div className="px-6 mt-6">
                {/* {data.status === "OPEN" && isOpenNow ? (
                    <Link
                        to="/state/reservation/step-1"
                        className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                        style={{ background: "var(--color-primary)" }}
                    >
                        Make Reservation or Take Away Here
                    </Link>
                ) : (
                    <div className="block w-full py-3 rounded-md font-semibold text-white text-center bg-gray-400 cursor-not-allowed">
                        Closed ({data.openHours} - {data.closedHours})
                    </div>
                )} */}
                <Link
                    to="/state/reservation/step-1"
                    className="block w-full py-3 rounded-md font-semibold text-white hover:text-white text-center"
                    style={{ background: "var(--color-primary)" }}
                >
                    Make Reservation or Take Away Here
                </Link>

                <Link
                    to="/state/reservation/search"
                    className="block w-full mt-4 py-3 rounded-md font-semibold text-white hover:text-white text-center bg-transparent underline"
                >
                    Check Your Booking Status
                </Link>
            </div>

            <PromotionSection
                promotions={promotions}
                selectedPromo={selectedPromo}
                setSelectedPromo={setSelectedPromo}
            />
        </>
    );
}
function PromotionSection({
    promotions,
    selectedPromo,
    setSelectedPromo,
}: any) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(
            el.scrollLeft + el.clientWidth < el.scrollWidth - 5
        );
    };

    useEffect(() => {
        checkScroll();
    }, [promotions]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        const scrollAmount = 250;

        el.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });

        setTimeout(checkScroll, 300);
    };

    return (
        <div className="mt-8 px-6 pb-4 relative">
            <h2 className="text-lg font-semibold">Promotions</h2>

            {promotions.length === 0 ? (
                <p className="text-gray-300">No promotion available</p>
            ) : (
                <div className="relative pt-8">
                    {/* LEFT ARROW */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll("left")}
                            className="absolute right-12 top-0 -translate-y-1/2 z-10 bg-primary text-white  p-1 rounded-full"
                        >
                            <ArrowLeftCircle />
                        </button>
                    )}

                    {/* RIGHT ARROW */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-0 -translate-y-1/2 z-10 bg-primary text-white p-1 rounded-full"
                        >
                            <ArrowRightCircle />
                        </button>
                    )}

                    {/* SCROLL AREA */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                    >
                        {promotions.map((p: any) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPromo(p)}
                                className="min-w-[220px] rounded-xl overflow-hidden bg-black/40 border border-white/10 text-left hover:border-primary"
                            >
                                <img
                                    src={p.photo || DUMMY_IMAGE}
                                    className="h-48 w-full object-cover"
                                />
                                <div className="p-3">
                                    <h3 className="font-semibold text-white">
                                        {p.title}
                                    </h3>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL tetap seperti sebelumnya */}
            {selectedPromo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setSelectedPromo(null)}
                    />
                    <div className="relative bg-white text-black rounded-md max-w-md md:w-[28rem] w-full overflow-hidden">
                        <img
                            src={selectedPromo.photo || DUMMY_IMAGE}
                            className="w-full object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                {selectedPromo.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {selectedPromo.description}
                            </p>
                            <button
                                onClick={() => setSelectedPromo(null)}
                                className="mt-4 w-full py-2 rounded-md bg-primary text-white font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
