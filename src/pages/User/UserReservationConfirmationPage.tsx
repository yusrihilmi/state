import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationStore } from "../../stores/useReservationStore";
import { toast } from "react-toastify";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";

export default function UserReservationConfirmationPage() {
    const navigate = useNavigate();

    const { data, reservation, fetchReservationStyle, setReservation, confirmReservation } = useReservationStore();

    const [layoutConfig, setLayoutConfig] = useState<any>(null);

    useEffect(() => {
        const step5 = localStorage.getItem("reservation_step_5");
        const step4 = localStorage.getItem("reservation_step_4");

        if (step5) {
            setReservation(JSON.parse(step5));
        } else if (step4) {
            setReservation(JSON.parse(step4));
        }
    }, []);


    useEffect(() => {
        const layoutRaw = localStorage.getItem("layout");
        if (layoutRaw) {
            setLayoutConfig(JSON.parse(layoutRaw));
        }
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });


    useEffect(() => {
        fetchReservationStyle();
    }, []);

    if (!data) return null;

    const logoUrl = data.logo
        ? `${data.logo}`
        : "https://dummyimage.com/200x200/000/fff";

    const totalPrice =
        reservation?.orderedMenu?.reduce((acc: number, item: any) => {
            return acc + Number(item.price) * Number(item.qty);
        }, 0) || 0;

    const minimumPax = Number(data.minimumPax || 0);
    const minimumDP = Number(data.minimumDP || 0);
    const minimumPercentage = Number(data.minimumPercentage || 0);
    const minimumPayment = Number(data.minimumPayment || 0);

    const guest = Number(reservation?.totalPax || 0);
    const menuCount = reservation?.orderedMenu?.length || 0;

    let needDp = false;
    let depositAmount = 0;
    let usePercentage = false;

    // ===== CASE 1 & 2 =====
    if (guest >= minimumPax) {
        needDp = true;

        if (menuCount === 0) {
            depositAmount = minimumDP;
            usePercentage = false;
        } else {
            depositAmount = (totalPrice * minimumPercentage) / 100;
            usePercentage = true;
        }
    }

    // ===== CASE 3 & 4 =====
    else if (guest < minimumPax && menuCount > 0) {
        if (totalPrice >= minimumPayment) {
            needDp = true;
            depositAmount = (totalPrice * minimumPercentage) / 100;
            usePercentage = true;
        } else {
            needDp = false;
            depositAmount = 0;
            usePercentage = false;
        }
    }

    // ===== CASE 5 =====
    else {
        needDp = false;
        depositAmount = 0;
        usePercentage = false;
    }


    const handleNext = async () => {
        const step5Raw = localStorage.getItem("reservation_step_5");
        const step4Raw = localStorage.getItem("reservation_step_4");
        const payload = step5Raw ? JSON.parse(step5Raw) : step4Raw ? JSON.parse(step4Raw) : null;

        if (!payload) {
            alert("Reservation data is missing!");
            return;
        }

        const finalPayload = {
            ...payload,
            needDp: needDp,
            totalDp: depositAmount
        };

        const result = await confirmReservation(finalPayload);
        if (result) {
            localStorage.setItem("reservation_step_6", JSON.stringify(result));
    toast.success("Booking confirmed successfully!");
            navigate("/state/reservation/step-7");
        } else {
            toast.error("Failed to confirm booking. Please try again.");
        }
    };


    return (
        <div className="relative h-screen font-montserrat text-white overflow-hidden">

            {/* BACKGROUND */}
            <img src={data.backgroundImage || bgImage} className="absolute inset-0 w-full h-full object-cover" />
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
                                    width: "90%",
                                    background: "var(--color-primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">

                    {/* ================= ACTION ================= */}
                    <div className="px-6 mt-6 space-y-3 pb-10">

                        {reservation && (
                            <div className="bg-white text-black rounded-md p-5 space-y-4 shadow">

                                <h2 className="text-center font-semibold text-primary">
                                    Review your booking
                                </h2>

                                <div className="space-y-3 text-sm">

                                    <div className="flex gap-3 items-start">
                                        <span>👤</span>
                                        <span>{reservation.customerName}</span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <span>📅</span>
                                        <span>
                                            {formatDate(reservation.date)} <br />
                                            {reservation.time}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <span>👥</span>
                                        <span>{reservation.totalPax} Guests</span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <span>📞</span>
                                        <span>{reservation.customerPhone}</span>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <span>✉️</span>
                                        <span>{reservation.customerEmail}</span>
                                    </div>

                                    {reservation.instagram && (
                                        <div className="flex gap-3 items-start">
                                            <span>📷</span>
                                            <span>{reservation.customerInstagram}</span>
                                        </div>
                                    )}

                                </div>


                                {reservation.orderedMenu && reservation.orderedMenu.length > 0 && (
                                    <div className="pt-3 border-t">

                                        <p className="font-semibold text-sm mb-2">
                                            Ordered Menu
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            {reservation.orderedMenu.map((item: any) => {
                                                const subtotal = Number(item.price) * Number(item.qty);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-start"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.category?.name}
                                                            </p>

                                                            {/* Harga satuan */}
                                                            <p className="text-xs text-gray-500">
                                                                Rp {Number(item.price).toLocaleString("id-ID")} / item
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="font-medium">
                                                                x{item.qty}
                                                            </p>

                                                            {/* Subtotal */}
                                                            <p className="text-sm font-semibold">
                                                                Rp {subtotal.toLocaleString("id-ID")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="pt-3 border-t flex justify-between font-semibold text-sm">
                                                <span>Total</span>
                                                <span>
                                                    Rp {totalPrice.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {needDp && (
                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between font-semibold text-sm text-red-600">
                                            <span>Total DP to Pay
                                                {usePercentage && ` (${minimumPercentage}%)`}</span>
                                            <span>
                                                Rp {depositAmount.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                )}


                                {/* SPECIAL REQUEST */}
                                {reservation.note && (
                                    <>
                                        <div className="pt-3 border-t text-sm">
                                            <p className="font-semibold mb-1">Special Request</p>
                                            <p className="text-gray-700">{reservation.note}</p>
                                        </div>
                                    </>
                                )}

                                {/* TERMS */}
                                <div className="pt-3 border-t text-xs text-gray-600">
                                    <p className="font-semibold text-sm mb-2">Terms & Conditions</p>

                                    <div
                                        className="prose prose-sm max-w-md break-words overflow-hidden
               [&_ol]:list-decimal 
               [&_ol]:pl-5 
               [&_li]:mb-1"
                                        dangerouslySetInnerHTML={{
                                            __html: layoutConfig?.termsNConditions || "",
                                        }}
                                    />
                                </div>

                            </div>
                        )}


                        <div className="flex gap-4">

                            <button
                                onClick={() => {
                                    const hasStep5 = localStorage.getItem("reservation_step_5");

                                    if (hasStep5) {
                                        navigate("/state/reservation/step-5-request");
                                    } else {
                                        navigate("/state/reservation/step-4");
                                    }
                                }}
                                className="w-full py-3 block text-center rounded-lg hover:text-gray-700 bg-gray-300 text-gray-700"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-full py-3 rounded-lg font-semibold text-white"
                                style={{ background: "var(--color-primary)" }}
                            >
                                Confirm
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
