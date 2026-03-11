import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";


export default function UserReservationGuestPage() {
    const navigate = useNavigate();
    const { data, fetchReservationStyle } = useReservationStore();

    const [guest, setGuest] = useState<number>(1);
    const [customGuest, setCustomGuest] = useState<string>("");

    useEffect(() => {
        fetchReservationStyle();
    }, []);

    

    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_2");

        if (!raw) return;

        try {
            const saved = JSON.parse(raw);

            if (typeof saved.totalPax === "number") {
                if (saved.totalPax > 10) {
                    setCustomGuest(String(saved.totalPax));
                    setGuest(1); // dummy, biar button 1–10 ga aktif
                } else {
                    setGuest(saved.totalPax);
                    setCustomGuest("");
                }
            }
        } catch (err) {
            console.error("Failed to parse reservation_step_2", err);
        }
    }, []);

    if (!data) return null;

    const logoUrl = data.logo
        ? `${data.logo}`
        : "https://dummyimage.com/200x200/000/fff";

    const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    const totalGuest =
        customGuest && Number(customGuest) > 10
            ? Number(customGuest)
            : guest;


    const handleNext = () => {
        const raw = localStorage.getItem("reservation_step_1");
        const step1 = raw ? JSON.parse(raw) : {};

        const payload = {
            ...step1,
            totalPax: totalGuest,
        };

        localStorage.setItem(
            "reservation_step_2",
            JSON.stringify(payload)
        );

        navigate("/state/reservation/step-4");
    };


    const handleNextOrder = () => {
        const raw = localStorage.getItem("reservation_step_1");
        const step1 = raw ? JSON.parse(raw) : {};

        const payload = {
            ...step1,
            totalPax: totalGuest,
        };

        localStorage.setItem(
            "reservation_step_2",
            JSON.stringify(payload)
        );

        navigate("/state/reservation/step-3-order");
    };

    return (
        <div className="relative h-screen font-montserrat text-white overflow-hidden">

            {/* BACKGROUND */}
            <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 max-w-md w-full md:w-[28rem] md:justify-self-center">

                {/* ================= HEADER ================= */}
                <div className="sticky top-0 z-30 backdrop-blur px-6 pt-6 pb-4">

                    <img
                        src={logoMillbook}
                        className="absolute rounded-full top-6 right-6 h-6"
                    />

                    <div className="flex items-center gap-4">
                        <img
                            src={logoUrl}
                            className="w-14 h-14 rounded-full border object-cover"
                        />
                        <h1 className="text-lg font-semibold flex-1 truncate">
                            {data.name}
                        </h1>
                    </div>

                    {/* progress */}
                    <div className="mt-4">
                        <div className="h-1 bg-white/20 rounded-full">
                            <div
                                className="h-1 rounded-full"
                                style={{
                                    width: "50%",
                                    background: "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">

                    {/* ================= GUEST ================= */}
                    <div className="mt-8 px-6">
                        <p className="text-sm mb-4">How many Guests?</p>

                        <div className="grid grid-cols-5 gap-3">
                            {guestOptions.map((num) => {
                                const isActive =
                                    !customGuest && guest === num;

                                return (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setGuest(num);
                                            setCustomGuest("");
                                        }}
                                        className={`h-14 rounded-lg font-semibold ${isActive
                                            ? "text-white"
                                            : "bg-white text-black"
                                            }`}
                                        style={{
                                            background: isActive
                                                ? "var(--color-primary)"
                                                : undefined,
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
                    <div className="mt-6 px-6">
                        <p className="text-sm mb-2">Total Guest</p>

                        <div
                            className="bg-white rounded-xl py-4 text-center font-semibold text-lg"
                            style={{ color: "var(--color-primary)" }}
                        >
                            {totalGuest} Guests
                        </div>
                    </div>

                    {/* ================= ACTION ================= */}
                    <div className="px-6 mt-6 space-y-3 pb-10">

                        <button
                            onClick={handleNextOrder}
                            className="w-full py-3 rounded-lg font-semibold transition-all border hover:text-primary hover:border-primary border-primary text-primary bg-white"
                        >
                            Order Menu Now
                        </button>

                        <button
                            onClick={handleNext}
                            className="w-full py-3 rounded-lg font-semibold text-white"
                            style={{ background: "var(--color-primary)" }}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => {
                                navigate("/state/reservation/step-1");
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
