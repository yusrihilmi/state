import { useEffect, useState } from "react";
import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";
import { useRestaurantSettingStore } from "../stores/useRestaurantSettingStore";
import { useReservationStore } from "../stores/useReservationStore";
import { HexColorPicker } from "react-colorful";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const TENANT_ID = 1;

export default function RestaurantSettings() {
  const {
    data,
    loading,
    fetchRestaurantSetting,
    updateRestaurantSetting,
  } = useRestaurantSettingStore();
  const { fetchReservationStyle } = useReservationStore();

  const [form, setForm] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [canSave, setCanSave] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const access = parsed?.state?.user?.access || [];

      const hasPermission = access.some(
        (item: any) =>
          item.menu_id === 15 &&
          item.no_access === false &&
          item.view_edit === true
      );

      setCanSave(hasPermission);
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  useEffect(() => {
    const handleClickOutside = () => setOpenPicker(null);
    if (openPicker) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openPicker]);


  /* ================= FETCH ================= */
  useEffect(() => {
    fetchRestaurantSetting(TENANT_ID);
  }, []);

  /* ================= HYDRATE FORM ================= */
  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        termsNConditions: data.termsNConditions || ""
      });
    }
  }, [data]);

  if (!form) return null;

  const quillModules = {
    toolbar: [
      [{ list: "ordered" }]
    ]
  };



  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key !== "logo" && value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });

    if (logoFile) {
      fd.append("logo", logoFile);
    }
    if (bgImageFile) {
      fd.append("backgroundImage", bgImageFile);
    }


    try {
      await updateRestaurantSetting(TENANT_ID, fd);


      fetchReservationStyle();

      localStorage.setItem("layout", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to update restaurant setting:", error);
    }
  };


  /* ================= LOGO PREVIEW ================= */
  const logoPreview = logoFile
    ? URL.createObjectURL(logoFile)
    : form.logo
      ? `${form.logo}`
      : "https://dummyimage.com/600/000/fff";

  const backgroundImage = bgImageFile
    ? URL.createObjectURL(bgImageFile)
    : form.logo
      ? `${form.backgroundImage}`
      : "https://dummyimage.com/600/000/fff";

  const generateTimeOptions = () => {
    const times: string[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formatted = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        times.push(formatted);
      }
    }

    return times;
  };

  const timeOptions = generateTimeOptions();


  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-[#EAEAEA] p-4 flex gap-4 overflow-auto">
          <div className="flex-1 bg-white rounded-lg overflow-auto">
            <h1 className="m-4 text-2xl font-bold">Restaurants Settings</h1>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LOGO */}
                <div className="flex gap-6">
                  <div>
                    <label className="text-sm font-medium">Logo Restaurant</label>
                    <div className="mt-4 w-60">
                      <div className="relative group cursor-pointer">
                        <img
                          src={logoPreview}
                          className="w-full h-60 object-cover rounded-full border"
                        />
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full cursor-pointer">
                          <span className="text-white text-sm">
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setLogoFile(e.target.files?.[0] || null)
                              }
                            />
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Background Image</label>
                    <div className="mt-4 w-60">
                      <div className="relative group cursor-pointer">
                        <img
                          src={backgroundImage}
                          className="w-full h-60 object-cover rounded-md border"
                        />
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-md cursor-pointer">
                          <span className="text-white text-sm">
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setBgImageFile(e.target.files?.[0] || null)
                              }
                            />
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>

                {/* COLORS + LAYOUT */}
                <div className="flex gap-4">
                  <div className="space-y-4 flex-1">
                    {[
                      { label: "Primary Color", name: "primaryColor" },
                      { label: "Secondary Color", name: "secondaryColor" },
                      { label: "Accent Color", name: "buttonHoverColor" },
                    ].map((c) => (
                      <div key={c.name} className="relative">
                        <label className="text-sm font-medium">{c.label}</label>

                        <div className="flex items-center gap-3 mt-1">
                          {/* Clickable color box */}
                          <div
                            className="w-10 h-10 rounded-md border cursor-pointer"
                            style={{ background: form[c.name] }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPicker(openPicker === c.name ? null : c.name);
                            }}
                          />

                          {/* Hex input */}
                          <input
                            name={c.name}
                            value={form[c.name] || ""}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 border rounded-md"
                          />
                        </div>

                        {/* Color Picker Popup */}
                        {openPicker === c.name && (
                          <div className="absolute z-50 mt-2 bg-white p-3 rounded-lg shadow-lg">
                            <HexColorPicker
                              color={form[c.name] || "#000000"}
                              onChange={(color) =>
                                setForm((prev: any) => ({
                                  ...prev,
                                  [c.name]: color,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>


                  <div className="w-full">
                    <label className="text-sm font-medium">Layout</label>
                    <select
                      name="layout"
                      value={form.layout}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md px-3 py-2 text-sm border"
                    >
                      <option value="default">Default</option>
                      <option value="custom2">Layout 2</option>
                      <option value="custom3">Layout 3</option>
                    </select>
                  </div>
                </div>

                {/* TEXT FIELDS */}
                {[
                  ["Restaurant Name", "name"],
                  ["Description", "description", true],
                  ["Address", "address"],
                  ["Bank Type", "bankType"],
                  ["Bank Name", "bankName"],
                  ["Account Number", "accountNumber"],
                  ["City", "city"],
                  ["State", "state"],
                  ["Postal Code", "postalCode"],
                  ["Country", "country"],
                  ["Phone", "phone"],
                  ["Email", "email"],
                  ["Minimum DP", "minimumDP"],
                  ["Minimum Pax", "minimumPax"],
                  ["Minimum Percentage (%)", "minimumPercentage"],
                  ["Minimum Payment", "minimumPayment"],
                ].map(([label, name, textarea]: any) => (
                  <div key={name}>
                    <label className="text-sm font-medium">{label}</label>
                    {textarea ? (
                      <textarea
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md mt-1"
                      />
                    ) : (
                      <input
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md mt-1"
                      />
                    )}
                  </div>
                ))}

                {/* WEBSITE */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Website</label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  />
                </div>



                {/* TERMS & CONDITIONS */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Terms & Conditions</label>

                  <div className="mt-2 bg-white">
                    <ReactQuill
                      theme="snow"
                      value={form.termsNConditions || ""}
                      onChange={(value) =>
                        setForm((prev: any) => ({
                          ...prev,
                          termsNConditions: value
                        }))
                      }
                      modules={quillModules}
                    />
                  </div>
                </div>
                {/* OPENING HOURS */}

                {/* OPEN HOUR */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Open Hour</label>
                  <select
                    name="openHours"
                    value={form.openHours || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  >
                    <option value="">Select Time</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CLOSE HOUR */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Close Hour</label>
                  <select
                    name="closedHours"
                    value={form.closedHours || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  >
                    <option value="">Select Time</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="text-sm font-medium">Stay Duration</label>
                  <input
                    type="number"
                    name="stayDuration"
                    value={form.stayDuration || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  />
                </div>



                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  >
                    <option value="OPEN">Active</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                </div>
              </div>

              {/* SAVE */}
              <div className="flex justify-end mt-6">
                {canSave && (
                  <button
                    disabled={loading}
                    onClick={handleSave}
                    className="px-8 py-2 rounded-md bg-[#968859] text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
