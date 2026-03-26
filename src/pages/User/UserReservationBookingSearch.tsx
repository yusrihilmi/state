import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";
import { QRCodeSVG } from "qrcode.react";

export default function UserReservationBookingSearch() {
  const navigate = useNavigate();

  const {
    data,
    fetchReservationStyle,
    bookingDetail,
    fetchBookingByCode,
    fetchBookingByPhone,
    loading,
    resetBooking,
    error,
  } = useReservationStore();

  const bookingRef = useRef<HTMLDivElement>(null);

  const [searchCode, setSearchCode] = useState("");
  const [reservation, setReservation] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [layoutConfig, setLayoutConfig] = useState<any>(null);
  const [bookingList, setBookingList] = useState<any[]>([]);

  useEffect(() => {
    fetchReservationStyle();
    resetBooking();
    setReservation(null);
    setSearchCode("");
    setSaved(false);
  }, []);

  // ✅ mapping hasil API ke UI format
  useEffect(() => {

    if (!bookingDetail) {
      setReservation(null);
      return;
    }

    setReservation({
      ...bookingDetail,
      status: bookingDetail.status,
      guest: bookingDetail.totalPax,
      orderedMenu: bookingDetail.bookingMenus?.map((item: any) => ({
        id: item.id,
        name: item.menu?.name,
        price: item.menu?.price,
        qty: item.qty,
      })) || [],
      timeLabel: bookingDetail.time,
      fullname: bookingDetail.customer?.fullname,
      phone: bookingDetail.customer?.phone,
      email: bookingDetail.customer?.email,
      instagram: bookingDetail.customer?.instagram,
      note: bookingDetail.note ?? null,
    });
  }, [bookingDetail]);

  useEffect(() => {
    const layoutRaw = localStorage.getItem("layout");
    if (layoutRaw) {
      setLayoutConfig(JSON.parse(layoutRaw));
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "waiting_list":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

const handleSearch = async () => {
  if (!searchCode) return;

  setReservation(null);
  setBookingList([]);

  if (searchCode.length <= 6) {
    // 🔥 BY CODE
    await fetchBookingByCode(searchCode.toUpperCase());
  } else {
    // 🔥 BY PHONE
    const res = await fetchBookingByPhone(searchCode);

    if (res?.length) {
      // optional: sort terbaru
      const sorted = res.sort(
        (a: any, b: any) =>
          new Date(b.date + " " + b.time).getTime() -
          new Date(a.date + " " + a.time).getTime()
      );

      setBookingList(sorted);
    }
  }
};

  useEffect(() => {
    if (bookingDetail) {
      setBookingList([]); // clear list kalau sudah masuk detail
    }
  }, [bookingDetail]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!data) return null;

  const logoUrl = data.logo || "https://dummyimage.com/200x200/000/fff";

  const totalPrice =
    reservation?.orderedMenu?.reduce((acc: number, item: any) => {
      return acc + Number(item.price) * Number(item.qty);
    }, 0) || 0;

  const A4_WIDTH = 210;
  const A4_HEIGHT = 397;
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

  const isCompleted = reservation && reservation.statusDp === "completed";

  const minimumPax = layoutConfig?.minimumPax ?? 0;

  const bookingTitle = reservation?.needDp
    ? (isCompleted
      ? "Booking Registration Complete!"
      : "Booking Pending Payment!")
    : (reservation?.guest >= minimumPax
      ? "Booking Pending Payment!"
      : "Booking Registration Complete!");

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
          <div className="px-6 mt-6 space-y-4 pb-10">

            {/* SEARCH SECTION */}
            {!reservation && (
              <div className="bg-white p-5 rounded-xl text-black space-y-4 shadow">
                <h2 className="text-lg font-semibold text-center">
                  Search Your Booking
                </h2>

                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Booking Code or Phone Number"
                  className="w-full border rounded-lg px-3 py-2 text-center uppercase"
                />

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-primary text-white"
                >
                  {loading ? "Searching..." : "Search"}
                </button>

                {error && (
                  <p className="text-red-500 text-sm text-center">
                    Booking not found
                  </p>
                )}
              </div>
            )}

            {/* BOOKING LIST (PHONE SEARCH) */}
            {!reservation && bookingList.length > 0 && (
              <div className="bg-white p-5 rounded-xl text-black space-y-3 shadow">
                <h2 className="text-lg font-semibold text-center">
                  Your Bookings
                </h2>

                {bookingList.map((item) => (
                  <div
                    key={item.id}
                    onClick={async () => {
                      // 🔥 klik → ambil detail by code
                      await fetchBookingByCode(item.bookingCode);
                    }}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-semibold">
                        {item.bookingCode}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(item.status)}`}>
                        {item.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(item.date)} • {item.time}
                    </div>
                  </div>
                ))}
              </div>
            )}


            {/* PDF BUTTON */}
            {reservation && (

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
            )}

            {/* RESERVATION CARD */}
            {reservation && (
              <div
                ref={bookingRef}
                className="bg-white text-black rounded-xl p-5 space-y-4 shadow"
              >

                <h2 className="text-center font-semibold text-primary">
                  {bookingTitle}
                </h2>
                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      reservation.status
                    )}`}
                  >
                    {reservation.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

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
                  {reservation.needDp && (
                    <div className="mt-4 p-3 border border-dashed border-gray-400 rounded-lg text-sm">

                      {/* ===== BELUM BAYAR / PENDING ===== */}
                      {!isCompleted && (
                        <>
                          <p className="font-semibold mb-1">⚠️ Deposit Payment Information</p>

                          <p className="text-sm">
                            Deposit Amount :
                            <b> Rp {Number(reservation.totalDp).toLocaleString("id-ID")}</b>
                          </p>

                          <p className="mt-2">
                            <b>Please transfer the deposit to the following account:</b>
                            <br />
                            {layoutConfig?.bankType} - {layoutConfig?.bankName}<br />
                            Account Number: <b>{data.accountNumber}</b>
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            After transferring, please upload the payment proof.
                          </p>
                        </>
                      )}

                      {/* ===== SUDAH BAYAR / COMPLETED ===== */}
                      {isCompleted && (
                        <>
                          <p className="font-semibold mb-2 text-green-600">
                            ✅ Deposit Payment Submitted
                          </p>

                          <p className="text-sm">
                            Deposit Amount :
                            <b> Rp {Number(reservation.totalDp).toLocaleString("id-ID")}</b>
                          </p>
                        </>
                      )}
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

            <button
              onClick={() => {
                resetBooking(); // ini penting
                setReservation(null);
                setSearchCode("");
                localStorage.removeItem("reservation_step_1");
                localStorage.removeItem("reservation_step_2");
                localStorage.removeItem("reservation_step_3");
                localStorage.removeItem("reservation_step_4");
                localStorage.removeItem("reservation_step_5");
                localStorage.removeItem("reservation_step_6");

                setTimeout(() => {
                  navigate("/state/reservation");
                }, 100);
              }}
              className="w-full py-3 rounded-lg bg-gray-300 text-gray-700 hover:text-gray-700"
            >
              Close
            </button>

            {reservation && (
              <button
                onClick={() => {
                  resetBooking(); // ini penting
                  setReservation(null);
                  setSearchCode("");
                }}
                className="w-full py-2 rounded-lg bg-gray-300 text-black"
              >
                Search Another Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
