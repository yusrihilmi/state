import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";
import { QRCodeSVG } from "qrcode.react";


export default function UserReservationBookingConfirmPage() {
  const navigate = useNavigate()
  const { data, fetchReservationStyle } = useReservationStore();
  const bookingRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [reservation, setReservation] = useState<any>(null);
  const [layoutConfig, setLayoutConfig] = useState<any>(null);

  useEffect(() => {
    localStorage.removeItem("reservation_step_1");
    localStorage.removeItem("reservation_step_2");
    localStorage.removeItem("reservation_step_3");
    localStorage.removeItem("reservation_step_4");
    localStorage.removeItem("reservation_step_5");
    const step6Raw = localStorage.getItem("reservation_step_6");
    if (step6Raw) {
      const parsed = JSON.parse(step6Raw);
      if (parsed.data) {
        // ambil data utama
        const mainData = parsed.data;
        setReservation({
          ...mainData,
          guest: mainData.totalPax,

          orderedMenu: mainData.bookingMenus
            ? mainData.bookingMenus.map((item: any) => ({
              id: item.id,
              name: item.menu?.name,
              description: item.menu?.description,
              price: item.menu?.price,
              qty: item.qty,
            }))
            : [],

          timeLabel: mainData.time,
          fullname: mainData.customer?.fullname,
          phone: mainData.customer?.phone,
          email: mainData.customer?.email,
          instagram: mainData.customer?.instagram,

          note: mainData.note ?? null,
        });

      }
    }
  }, []);

  useEffect(() => {
    const layoutRaw = localStorage.getItem("layout");
    if (layoutRaw) {
      setLayoutConfig(JSON.parse(layoutRaw));
    }
  }, []);

  useEffect(() => {
    fetchReservationStyle();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!data || !reservation) return null;

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

  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const MARGIN = 10;
  const PAGE_WIDTH = A4_WIDTH - MARGIN * 2;
  const PAGE_HEIGHT = A4_HEIGHT - MARGIN * 2;

  const handleSavePdf = async () => {
    if (!bookingRef.current || saving || saved) return;

    try {
      setSaving(true);

      const clone = bookingRef.current.cloneNode(true) as HTMLElement;
      clone.style.width = "1024px";
      clone.style.maxWidth = "none";
      clone.style.transform = "none";

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-99999px";
      wrapper.style.left = "0";
      wrapper.style.width = "1024px";
      wrapper.style.background = "#ffffff";
      wrapper.appendChild(clone);

      document.body.appendChild(wrapper);
      await new Promise((r) => setTimeout(r, 50));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1024,
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pxToMm = (px: number) => px * 0.264583;
      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);
      const scale = PAGE_WIDTH / imgWidthMm;
      const scaledHeight = imgHeightMm * scale;

      let y = 0;
      let page = 0;

      while (y < scaledHeight) {
        if (page > 0) pdf.addPage();

        pdf.addImage(imgData, "PNG", MARGIN, MARGIN - y, PAGE_WIDTH, scaledHeight);

        y += PAGE_HEIGHT;
        page++;
      }

      const blobUrl = pdf.output("bloburl");
      window.open(blobUrl, "_blank");
      setSaved(true);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative h-screen font-montserrat text-white overflow-hidden">
      {/* BACKGROUND */}
      <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 max-w-md w-full md:w-[28rem] md:justify-self-center">
        {/* HEADER */}
        <div className="sticky top-0 z-30 backdrop-blur px-6 pt-6 pb-4">
          <img src={logoMillbook} className="absolute rounded-full top-6 right-6 h-6" />
          <div className="flex items-center gap-4">
            <img src={logoUrl} className="w-14 h-14 rounded-full border object-cover" />
            <h1 className="text-lg font-semibold flex-1 truncate">{data.name}</h1>
          </div>
          <div className="mt-4">
            <div className="h-1 bg-white/20 rounded-full">
              <div
                className="h-1 rounded-full"
                style={{ width: "100%", background: "var(--color-primary)" }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">
          <div className="px-6 mt-6 space-y-3 pb-10">
            {/* PDF BUTTON */}
            <button
              onClick={handleSavePdf}
              //   disabled={saving || saved}
              className={`w-full py-3 rounded-lg font-semibold transition ${saved
                ? "bg-green-600 text-white"
                : saving
                  ? "bg-primary/70 text-white"
                  : "bg-primary text-white hover:opacity-90"
                }`}
            >
              {saving && "Generating PDF..."}
              {!saving && saved && "Save Booking (PDF)"}
              {!saving && !saved && "Save Booking (PDF)"}
            </button>

            {/* RESERVATION CARD */}
            {reservation && (
              <div
                ref={bookingRef}
                className="bg-white text-black rounded-xl p-5 space-y-4 shadow"
              >
                <h2 className="text-center font-semibold text-primary">
                  {needDp
                    ? "Booking Pending Payment!"
                    : "Booking Registration Complete!"}
                </h2>

                <p className="text-center font-semibold text-primary">Confirmation will be sent shortly</p>
                <p className="text-center text-sm text-black mt-2">
                  <b>Please capture this confirmation page and keep it for your reference upon arrival.</b>
                </p>

                {/* QR CODE */}
                <div className="pt-4 border-t flex flex-col items-center gap-3">
                  <QRCodeSVG
                    value={`https://yusrihilmi.github.io/state/admin/reservation-calendar/${reservation.bookingCode}`}
                    size={160}
                    level="H"
                  />
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Booking Code</p>
                    <p className="font-mono font-semibold text-lg tracking-widest">
                      {reservation.bookingCode}
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div className="space-y-3 text-sm">
                  {depositAmount > 0 && (
                    <div className="mt-4 p-3 border border-dashed border-gray-400 rounded-lg text-sm">
                      <p className="font-semibold mb-1">⚠️ Deposit Payment Information - non refundable</p>

                      <p className="mt-2">
                        <b>Deposit Amount {usePercentage && ` (${minimumPercentage}%)`}:</b><br />
                        Rp {depositAmount.toLocaleString("id-ID")}
                      </p>

                      <p className="mt-2">
                        <b>Please transfer to:</b><br />
                        {layoutConfig?.bankType} - {layoutConfig?.bankName}<br />
                        Account Number: <b>{layoutConfig?.accountNumber}</b>
                      </p>

                      <p className="mt-2 text-xs text-gray-600">
                        Our admin team will contact you for confirmation.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 items-start">
                    <span>👤</span>
                    <span>{reservation.customer.fullname}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span>📅</span>
                    <span>
                      {formatDate(reservation.date)} <br />
                      {reservation.timeLabel}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span>👥</span>
                    <span>{reservation.guest} Guests</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span>📞</span>
                    <span>{reservation.customer.phone}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span>✉️</span>
                    <span>{reservation.customer.email}</span>
                  </div>
                  {reservation.customer.instagram && (
                    <div className="flex gap-3 items-start">
                      <span>📷</span>
                      <span>{reservation.customer.instagram}</span>
                    </div>
                  )}
                </div>

                {/* ORDERED MENU */}
                {reservation.orderedMenu && reservation.orderedMenu.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="font-semibold text-sm mb-2">Ordered Menu</p>
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

                {/* SPECIAL REQUEST */}
                {reservation.note && (
                  <div className="pt-3 border-t text-sm">
                    <p className="font-semibold mb-1">Special Request</p>
                    <p className="text-gray-700">{reservation.note}</p>
                  </div>
                )}

                {/* TERMS */}
                <div className="pt-3 border-t text-xs text-gray-600">
                  <p className="font-semibold text-sm mb-2">Terms & Conditions</p>

                  <div className="pt-3 border-t text-xs text-gray-600">

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
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem("reservation_step_1");
                localStorage.removeItem("reservation_step_2");
                localStorage.removeItem("reservation_step_3");
                localStorage.removeItem("reservation_step_4");
                localStorage.removeItem("reservation_step_5");
                localStorage.removeItem("reservation_step_6");
                navigate("/state/reservation");
              }}
              className="w-full py-3 rounded-lg bg-gray-300 text-gray-700 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
