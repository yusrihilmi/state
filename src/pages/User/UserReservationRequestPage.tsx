import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";


export default function UserReservationRequestPage() {
    const navigate = useNavigate();
    const { data, fetchReservationStyle, specialRequests, fetchSpecialRequests } = useReservationStore();

    const [form, setForm] = useState({
        note: "",
    });

    const handleSelectRequest = (text: string) => {
        setForm((prev) => {
            const existing = prev.note
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            // toggle behavior
            if (existing.includes(text)) {
                return {
                    ...prev,
                    note: existing.filter((t) => t !== text).join(", "),
                };
            }

            return {
                ...prev,
                note: existing.length ? `${existing.join(", ")}, ${text}` : text,
            };
        });
    };



    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    useEffect(() => {
        fetchReservationStyle();

        fetchSpecialRequests();
    }, []);

    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_5");
        if (!raw) return;

        try {
            const saved = JSON.parse(raw);

            setForm({
                note: saved.note || "",
            });
        } catch (err) {
            console.error("Failed to parse reservation_step_5", err);
        }
    }, []);


    if (!data) return null;

    const logoUrl = data.logo
        ? `${data.logo}`
        : "https://dummyimage.com/200x200/000/fff";


    const handleNext = () => {
        const step1 = JSON.parse(localStorage.getItem("reservation_step_1") || "{}");
        const step2 = JSON.parse(localStorage.getItem("reservation_step_2") || "{}");
        const step3 = JSON.parse(localStorage.getItem("reservation_step_3") || "{}");
        const step4 = JSON.parse(localStorage.getItem("reservation_step_4") || "{}");

        const payload = {
            ...step1,
            ...step2,
            ...step3,
            ...step4,
            ...form,
        };

        localStorage.setItem("reservation_step_5", JSON.stringify(payload));
        navigate("/state/reservation/step-6");
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
                                    width: "80%",
                                    background: "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">

                    {/* ================= ACTION ================= */}
                    <div className="px-6 mt-6 space-y-3 pb-10">

                        <div className="grid grid-cols-1 gap-2">
                            {!specialRequests.length ? (
                                <p className="text-white text-sm">Loading special requests...</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {specialRequests.map((item) => {
                                        const active = form.note
                                            .split(",")
                                            .map((t) => t.trim())
                                            .includes(item.title);

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleSelectRequest(item.title)}
                                                className={`px-3 py-2 rounded-lg h-20 text-sm border transition text-center
                        ${active
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-black border-gray-300"
                                                    }
                    `}
                                            >
                                                {item.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>



                        <div>
                            <label className="text-sm text-white">Special Request</label>
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                placeholder="Your request"
                                rows={4}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-black"
                            />
                        </div>


                        <button
                            onClick={handleNext}
                            className="w-full py-3 rounded-lg font-semibold text-white"
                            style={{ background: "var(--color-primary)" }}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem("reservation_step_5");
                                navigate("/state/reservation/step-4");
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
