import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationStore } from "../../stores/useReservationStore";
import { Trash2Icon } from "lucide-react";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";
import AddMenuOrderModal from "../../components/modal/AddMenuOrderModal";


export default function UserReservationMenuPage() {
    const [orderedMenu, setOrderedMenu] = useState<any[]>([]);
    const [showAddMenu, setShowAddMenu] = useState(true);
    const navigate = useNavigate();
    const { data, fetchReservationStyle } = useReservationStore();

    const changeOrderedQty = (id: number, delta: number) => {
        setOrderedMenu((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, qty: Math.max(1, m.qty + delta) } : m
            )
        );
    };

    const removeOrderedMenu = (id: number) => {
        setOrderedMenu((prev) => prev.filter((m) => m.id !== id));
    };


    useEffect(() => {
        fetchReservationStyle();
    }, []);

    useEffect(() => {
        const raw = localStorage.getItem("reservation_step_3");

        if (!raw) return;

        try {
            const saved = JSON.parse(raw);

            if (Array.isArray(saved.orderedMenu)) {
                setOrderedMenu(saved.orderedMenu);
            }
        } catch (err) {
            console.error("Failed to parse reservation_step_3", err);
        }
    }, []);


    if (!data) return null;

    const logoUrl = data.logo
        ? `${data.logo}`
        : "https://dummyimage.com/200x200/000/fff";

    const canNext = orderedMenu.length > 0;

    const handleNext = () => {
        if (!canNext) return;

        const raw1 = localStorage.getItem("reservation_step_1");
        const step1 = raw1 ? JSON.parse(raw1) : {};

        const raw2 = localStorage.getItem("reservation_step_2");
        const step2 = raw2 ? JSON.parse(raw2) : {};

        // ✅ map orderedMenu jadi menus dengan hanya menuId & qty
        const menus = orderedMenu.map((m) => ({
            menuId: m.id,
            qty: m.qty,
        }));

    const totalPrice = Number(
        orderedMenu
            .reduce((total, item) => {
                const priceNumber = Number(item.price);
                return total + priceNumber * item.qty;
            }, 0)
            .toFixed(2)
    );

        const payload = {
            ...step1,
            ...step2,
            orderedMenu,
            menus,
        totalPrice,
        };

        localStorage.setItem("reservation_step_3", JSON.stringify(payload));

        navigate("/state/reservation/step-4");
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
                                    width: "60%",
                                    background: "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-120px)] max-w-md content-center">

                    <div className="mx-6 mt-6 space-y-3 pb-4 bg-white rounded-xl flex flex-col">

                        {/* LIST MENU */}
                        <div className="text-sm flex-1 overflow-y-auto space-y-2 px-4 mt-4">
                            {orderedMenu.length === 0 ? (
                                <p className="text-gray-400 text-center py-6">
                                    No ordered menu yet
                                </p>
                            ) : (
                                orderedMenu.map((item, i) => (
                                    <div
                                        key={i}
                                        className="border rounded-md border-primary px-3 py-2 flex justify-between items-center"
                                    >
                                        {/* NAME + CANCEL */}
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">{item.name}</span>
                                        </div>

                                        <div className="flex items-center">

                                            <button
                                                onClick={() => removeOrderedMenu(item.id)}
                                                className="text-red-500 text-xs flex items-center gap-1"
                                            >
                                                <Trash2Icon className="h-3 w-3" />
                                            </button>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => changeOrderedQty(item.id, -1)}
                                                    className="px-2 py-0.5 border rounded text-sm"
                                                >
                                                    −
                                                </button>
                                                <span className="min-w-[20px] text-center">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => changeOrderedQty(item.id, 1)}
                                                    className="px-2 py-0.5 border rounded text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* QTY CONTROL */}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ADD MENU – STICKY BOTTOM */}
                        <div className="pt-3 mt-3 border-t bg-white sticky bottom-0">
                            <button
                                onClick={() => setShowAddMenu(true)}
                                className="w-full py-2 text-sm rounded-md bg-white text-primary border"
                            >
                                + Add Menu
                            </button>
                        </div>
                    </div>

                    {/* ================= ACTION ================= */}
                    <div className="px-6 mt-6 space-y-3 pb-10">
                        <button
                            onClick={handleNext}
                            className={`w-full py-3 rounded-lg font-semibold bg-[var(--color-primary)] text-white transition
                                ${canNext
                                    ? "opacity-100"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem("reservation_step_3");
                                navigate("/state/reservation/step-2");
                            }}
                            className="w-full py-3 rounded-lg bg-gray-300 text-gray-700 hover:text-gray-700"
                        >
                            Back
                        </button>
                    </div>

                    

                    <AddMenuOrderModal
                        open={showAddMenu}
                        initialSelected={orderedMenu}   // 🔥 kirim menu existing
                        onClose={() => setShowAddMenu(false)}
                        onSave={(newMenu: any[]) => {
                            setOrderedMenu(newMenu);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
