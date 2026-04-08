import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservationStore } from "../../stores/useReservationStore";
import logoMillbook from "../../assets/logo-millbook.png";
import bgImage from "../../assets/login-image.png";

export default function UserReservationCustomerPage() {
  const navigate = useNavigate();
  const { data, fetchReservationStyle } = useReservationStore();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerInstagram: "",
  });

  const [nextPath, setNextPath] = useState("/state/reservation/step-6");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchReservationStyle();
  }, []);

  useEffect(() => {
  const customerRaw = localStorage.getItem("customer-data");
  const step4Raw = localStorage.getItem("reservation_step_4");

  try {
    if (customerRaw) {
      const customer = JSON.parse(customerRaw);

      setForm({
        customerName: customer.customerName || "",
        customerPhone: customer.customerPhone || "",
        customerEmail: customer.customerEmail || "",
        customerInstagram: customer.customerInstagram || "",
      });

      return; // ✅ stop kalau customer-data ada
    }

    if (step4Raw) {
      const step4 = JSON.parse(step4Raw);

      setForm({
        customerName: step4.customerName || "",
        customerPhone: step4.customerPhone || "",
        customerEmail: step4.customerEmail || "",
        customerInstagram: step4.customerInstagram || "",
      });
    }
  } catch (err) {
    console.error("Failed to parse localStorage", err);
  }
}, []);


  const customerEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail);

  const isFormValid =
    form.customerName.trim() !== "" &&
    form.customerPhone.trim() !== "" &&
    customerEmailValid;

  if (!data) return null;

  const logoUrl = data.logo
    ? `${data.logo}`
    : "https://dummyimage.com/200x200/000/fff";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const step1 = JSON.parse(
      localStorage.getItem("reservation_step_1") || "{}"
    );
    const step2 = JSON.parse(
      localStorage.getItem("reservation_step_2") || "{}"
    );
    const step3 = JSON.parse(
      localStorage.getItem("reservation_step_3") || "{}"
    );

    const payload = {
      ...step1,
      ...step2,
      ...step3,
      ...form,
    };

    localStorage.setItem("reservation_step_4", JSON.stringify(payload));
    localStorage.setItem("customer-data", JSON.stringify(form));
    navigate(nextPath);
  };

  return (
    <div className="relative h-screen font-montserrat text-white overflow-hidden">
      <img src={data.backgroundImage || bgImage} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 max-w-md w-full md:w-[28rem] md:justify-self-center">
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

          <div className="mt-4">
            <div className="h-1 bg-white/20 rounded-full">
              <div
                className="h-1 rounded-full"
                style={{
                  width: "70%",
                  background: "var(--color-primary)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)] content-center">
          <form
            autoComplete="on"
            onSubmit={handleSubmit}
            className="px-6 mt-6 space-y-3 pb-10"
          >
            <div>
              <label className="text-sm text-white/80">Full Name</label>
              <input
                required
                name="customerName"
                autoComplete="name"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-black outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">Phone Number</label>
              <input
                required
                name="customerPhone"
                autoComplete="tel"
                value={form.customerPhone}
                onChange={handleChange}
                placeholder="08xxxx"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-black outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">Email</label>
              <input
                required
                type="email"
                name="customerEmail"
                autoComplete="email"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="Email@example.com"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-black outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">
                Instagram (optional)
              </label>
              <input
                name="customerInstagram"
                autoComplete="off"
                value={form.customerInstagram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full mt-1 px-4 py-3 mb-6 rounded-lg bg-white text-black outline-none"
              />
            </div>

            {/* Add Special Request */}
            <button
              type="submit"
              disabled={!isFormValid}
              onClick={() =>
                setNextPath("/state/reservation/step-5-request")
              }
              className={`w-full py-3 rounded-lg font-semibold transition-all border hover:text-primary hover:border-primary border-primary text-white
                ${isFormValid
                  ? "opacity-100"
                  : "opacity-50 cursor-not-allowed"
                }`}
            >
              + Add Special Request
            </button>

            {/* Next */}
            <button
              type="submit"
              disabled={!isFormValid}
              onClick={() =>
                setNextPath("/state/reservation/step-6")
              }
              className={`w-full py-3 rounded-lg font-semibold bg-[var(--color-primary)] text-white transition
                ${isFormValid
                  ? "opacity-100"
                  : "opacity-50 cursor-not-allowed"
                }`}
            >
              Next
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={() => {
                const hasStep3 =
                  localStorage.getItem("reservation_step_3");

                if (hasStep3) {
                  navigate("/state/reservation/step-3-order");
                } else {
                  navigate("/state/reservation/step-1");
                }
              }}
              className="w-full py-3 block text-center rounded-lg hover:text-gray-700 bg-gray-300 text-gray-700"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
