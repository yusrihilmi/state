import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { Trash2Icon } from "lucide-react";
import AddMenuModal from "./AddMenuModal";
import { useTableNumberStore } from "../../stores/useTableNumberStore";
import { useCustomerStore } from "../../stores/useCustomerStore";
import { useBookingStore } from "../../stores/useBookingStore";
import { useReservationStore } from "../../stores/useReservationStore";
import { useNewsTodayStore } from "../../stores/useNewsTodayStore";



const STATUS_LIST = [
  { value: "waiting_list", label: "Waiting List" },
  { value: "confirm", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];


export default function CustomerDataBookingModal({ open, data, onClose }: any) {
  const [detail, setDetail] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [orderedMenu, setOrderedMenu] = useState<any[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isSelectMenu, setIsSelectMenu] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dpFile, setDpFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTables, setSelectedTables] = useState<any[]>([]); // array of table objects
  const [needDp, setNeedDp] = useState(false);
  const [dpAmounts, setDpAmounts] = useState<
    { amount: string; date: string }[]
  >([
    { amount: "", date: "" },
    { amount: "", date: "" },
    { amount: "", date: "" },
    { amount: "", date: "" },
    { amount: "", date: "" },
  ]);
  const [isDpLocked, setIsDpLocked] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [isDpCompleted, setIsDpCompleted] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    fullname: "",
    phone: "",
    email: "",
    instagram: "",
  });
  const [form, setForm] = useState({
    date: "",
    time: "",
    totalPax: "",
    referenceNumber: "",
    totalDp: "",
    expectedLeaveTime: "",
    channel: "",
    leaveTime: "",
    spendMoney: "",
    note: "",
    downpaymentProof: "",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [role, setRole] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const userRole = parsed?.state?.user?.role;

      setRole(userRole);
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  const allowedRolesDp = [1, 4];
  const canSaveDp = role !== null && allowedRolesDp.includes(role);
  const allowedRoles = [1, 2, 3];
  const canSave = role !== null && allowedRoles.includes(role);


  const {
    items: customers,
    current: customer,
    setFilters,
    createCustomer,
    fetchCustomerById,
    fetchCustomers,
    clearCustomer,
  } = useCustomerStore();

  const { createBooking, updateBooking, updateBookingDp  } = useBookingStore();
  const {
    availableTimeSlots,
    fetchAvailableTimeSlots,
    loading: reservationLoading,
  } = useReservationStore();

  const {
    newsToday,
    loading: newsLoading,
    fetchNewsToday,
  } = useNewsTodayStore();

  useEffect(() => {
    if (!open) return;

    fetchNewsToday();
  }, [open]);

  useEffect(() => {
    if (!form.date) return;

    fetchAvailableTimeSlots(form.date);
  }, [form.date]);

  useEffect(() => {
    if (customer?.id) return; // ✅ STOP kalau sudah ada customer terpilih

    const t = setTimeout(() => {
      if (!customerSearch) {
        setFilters({});
        fetchCustomers(1, 10);
        setShowCustomerDropdown(false);
        return;
      }

      setFilters({ search: customerSearch });
      fetchCustomers(1, 10);
      setShowCustomerDropdown(true);
    }, 400);

    return () => clearTimeout(t);
  }, [customerSearch, customer?.id]);


const buildDpFormData = () => {
  const formData = new FormData();

  dpAmounts.forEach((dp, index) => {
    formData.append(`dp_${index + 1}`, dp.amount || "0");

    formData.append(
      `date_dp_${index + 1}`,
      dp.date ? new Date(dp.date).toISOString() : ""
    );
  });

  // 🔥 status: 1 = completed, 0 = belum
  formData.append("status", isDpCompleted ? "1" : "0");

  if (dpFile) {
    formData.append("downpayment_proof", dpFile);
  }

  return formData;
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    availableCategories,
    availableTables,
    fetchAvailableCategories,
    fetchAvailableTables,
  } = useTableNumberStore();

  useEffect(() => {
    if (form.date && form.time) {
      fetchAvailableCategories(form.date, form.time);
    }
  }, [form.date, form.time]);


  useEffect(() => {
    if (!data) return;

    if (
      availableTables.length > 0 &&
      data?.tables?.length > 0
    ) {
      const mappedTables = availableTables.filter(t =>
        data.tables.some((dt: any) => dt.id === t.id)
      );

      setSelectedTables(mappedTables);
    }
  }, [availableTables]);

  useEffect(() => {
    if (!form.date || !form.time || !selectedCategoryId) return;

    const bookingId = data?.id; // 🔥 otomatis detect edit mode

    fetchAvailableTables(
      form.date,
      form.time,
      selectedCategoryId,
      bookingId // undefined kalau create
    );

    // reset table hanya saat create
    if (!bookingId) {
      setSelectedTables([]);
    }
  }, [form.date, form.time, selectedCategoryId]);

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  useEffect(() => {
    if (orderedMenu.length === 0) {
      setIsSelectMenu(false);
    }
  }, [orderedMenu]);

  useEffect(() => {
    if (!open) {
      setDetail(null);

      setForm({
        date: "",
        time: "",
        totalPax: "",
        referenceNumber: "",
        totalDp: "",
        expectedLeaveTime: "",
        channel: "",
        leaveTime: "",
        spendMoney: "",
        note: "",
        downpaymentProof: ""
      });

      setNewCustomer({
        fullname: "",
        phone: "",
        email: "",
        instagram: "",
      });

      setCustomerSearch("");
      setStatus("");
      setSelectedTables([]);
      setOrderedMenu([]);
      setIsSelectMenu(false);
      setBookingCode("")
      setDpFile(null);
      clearCustomer(); // 🔥 penting ini

      return;
    }


    if (data) {
      // DETAIL MODE
      setDetail(data);
      setSelectedTables(data.tables || []);
      setStatus(data.status || "");
      setBookingCode(data.bookingCode || "")
      setSelectedCategoryId(data.category?.id || null);
      setNeedDp(!!data.needDp);
      console.log("selectedCategoryId", selectedCategoryId);
      console.log("availableCategories", availableCategories);

      if (data.statusDp === "completed") {
        setIsDpCompleted(true);
        setIsDpLocked(true); // 🔒 tidak bisa diubah lagi
      } else {
        setIsDpCompleted(false);
        setIsDpLocked(false); // ✅ masih bisa edit
      }

      // 🔥 FETCH CUSTOMER DETAIL
      if (data.customer?.id) {
        fetchCustomerById(data.customer.id);
      }

      const menus = data?.bookingMenus || [];

      const mappedMenus = menus.map((bm: any) => ({
        id: bm.menu.id,
        name: bm.menu.name,
        price: bm.menu.price,
        photo: bm.menu.photo,
        description: bm.menu.description,
        qty: bm.qty, // 🔥 pakai qty dari API
      }));

      // ===============================
      // 🔥 MAPPING DP
      // ===============================
      const mappedDp = [
        {
          amount: data.dp1 !== "0" ? data.dp1 : "0",
          date: formatDateOnly(data.dateDp1),
        },
        {
          amount: data.dp2 !== "0" ? data.dp2 : "0",
          date: formatDateOnly(data.dateDp2),
        },
        {
          amount: data.dp3 !== "0" ? data.dp3 : "0",
          date: formatDateOnly(data.dateDp3),
        },
        {
          amount: data.dp4 !== "0" ? data.dp4 : "0",
          date: formatDateOnly(data.dateDp4),
        },
        {
          amount: data.dp5 !== "0" ? data.dp5 : "0",
          date: formatDateOnly(data.dateDp5),
        },
      ];

      setDpAmounts(mappedDp);

      setForm({
        date: data.date || "",
        time: data.time || "",
        totalPax: data.totalPax || "",
        referenceNumber: data.referenceNumber || "",
        totalDp: data.totalDp || "",
        expectedLeaveTime: data.expectedLeaveTime || "",
        channel: data.channel || "",
        leaveTime: data.leaveTime || "",
        spendMoney: data.spendMoney || "",
        note: data.note || "",
        downpaymentProof: data.downpaymentProof || "",
      });


      setOrderedMenu(mappedMenus);
      setIsSelectMenu(mappedMenus.length > 0);
      setOrderedMenu(mappedMenus);

    } else {
      // ADD NEW MODE
      setDetail(null);
      setForm({
        date: "",
        time: "",
        totalPax: "",
        referenceNumber: "",
        totalDp: "",
        expectedLeaveTime: "",
        channel: "",
        leaveTime: "",
        spendMoney: "",
        note: "",
        downpaymentProof: "",
      });
      setIsDpCompleted(false);
      setIsDpLocked(false);

      setNewCustomer({
        fullname: "",
        phone: "",
        email: "",
        instagram: "",
      });

      setSelectedTables([]);
      setSelectedCategoryId(null)
      setStatus("");
      setOrderedMenu([]);
      setIsSelectMenu(false);
      setNeedDp(false);
    }
  }, [open, data]);

  if (!open) return null;

  const hasMenu = isSelectMenu;

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

  const generateTimeOptions = () => {
    const times: string[] = [];

    try {
      const layoutStr = localStorage.getItem("layout");
      if (!layoutStr) return times;

      const layout = JSON.parse(layoutStr);
      const openHours = layout.openHours || "00:00";
      const closedHours = layout.closedHours || "23:45";

      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = parseTime(openHours);
      const endMinutes = parseTime(closedHours);

      for (let mins = startMinutes; mins <= endMinutes; mins += 15) {
        const hour = Math.floor(mins / 60);
        const minute = mins % 60;

        times.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }
    } catch (err) {
      console.error("Failed to generate time options:", err);
    }

    return times;
  };

  const timeOptions = generateTimeOptions();


  const handleDpAmountChange = (index: number, value: string) => {
    const updated = [...dpAmounts];
    updated[index].amount = value;
    setDpAmounts(updated);
  };

  const handleDpDateChange = (index: number, value: string) => {
    const updated = [...dpAmounts];
    updated[index].date = value;
    setDpAmounts(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let customerId: number | undefined = customer?.id;

      if (!customerId) {
        // if (!newCustomer.fullname || !newCustomer.phone) {
        //   alert("Customer name & phone required");
        //   setLoading(false);
        //   return;
        // }

        const createdCustomer = await createCustomer({
          fullname: newCustomer.fullname,
          phone: newCustomer.phone || "",
          email: newCustomer.email || "",
          instagram: newCustomer.instagram || "",
        });

        customerId = createdCustomer.id;
      }

      if (!customerId) {
        throw new Error("Customer ID not found");
      }



      // ===============================
      // 🔥 AUTO STATUS LOGIC
      // ===============================
      const totalPax = Number(form.totalPax || 0);
      // ===============================
      // 🔥 BUILD FORM DATA
      // ===============================
      const formData = new FormData();

      const tableIds = selectedTables.map(t => t.id);

      tableIds.forEach(id => {
        formData.append("tableIds", id.toString());
      });
      if (selectedCategoryId) {
        formData.append("categoryId", selectedCategoryId.toString());
      }
      formData.append("totalPax", totalPax.toString());
      formData.append("time", form.time);
      formData.append("referenceNumber", form.referenceNumber);
      formData.append("expectedLeaveTime", form.expectedLeaveTime);
      formData.append("channel", form.channel);
      formData.append("spendMoney", form.spendMoney);
      formData.append("date", form.date);
      formData.append("note", form.note || "");
      formData.append("needDp", needDp ? "true" : "false");
      formData.append("status", status);
      formData.append("customerId", customerId.toString());
      formData.append("isDpCompleted", isDpCompleted ? "true" : "false");
      const dpPayload = dpAmounts
        .map((v, i) => ({
          order: i + 1,
          amount: Number(v.amount) || 0,
        }))

      formData.append("dpAmounts", JSON.stringify(dpPayload));

      if (dpFile) {
        formData.append("downpaymentProof", dpFile);
      }

      if (orderedMenu.length > 0) {
        const menus = orderedMenu.map((m) => ({
          menuId: m.id,
          qty: m.qty,
        }));

        formData.append("menus", JSON.stringify(menus));
      }

      // ===============================
      // 🔥 CREATE OR UPDATE MODE
      // ===============================
      if (detail?.id) {
        await updateBooking(detail.id, formData);
      } else {
        await createBooking(formData);
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canEditTime =
    status === "waiting_list" || status === "confirm" || status === "seated";

  const canMoney =
    status === "completed";

  const isBookingTimePassed = () => {
    if (!form.date || !form.time) return false;

    const bookingDateTime = new Date(`${form.date}T${form.time}`);
    const now = new Date();

    return now >= bookingDateTime;
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#f2f2f2] w-[1100px] rounded-xl p-6 flex flex-col">

        <div className="flex gap-6 overflow-y-auto max-h-[500px] flex-col pr-4">

          <div className="flex  gap-6">
            {/* LEFT */}
            <div className="flex-1">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
                  <h3 className="font-semibold text-lg mb-4">{bookingCode}</h3>

                  {/* <p className="font-medium mb-2 text-sm">Customer Information</p> */}

                </div>


                <div className="flex flex-col w-1/2 text-sm">
                  {data?.needDp === true && (
                    <label><b>This booking is DP required</b></label>
                  )}
                  {/* <label>News Today</label>
                  <textarea
                    disabled
                    className="!bg-gray-200 mt-2 cursor-not-allowed min-h-[112px] max-h-[112px]"
                    value={
                      newsLoading
                        ? "Loading news..."
                        : newsToday?.newsToday || ""
                    }
                  /> */}

                </div>

              </div>

              <div className="w-full flex gap-4">
                <div className="w-2/3">

                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    {/* <div className="flex flex-col">
                      <div className="flex flex-col relative">
                        <label>Name</label>
                        <div ref={dropdownRef} className="relative w-full">
                          <input
                            disabled={!canEditTime}
                            className={`input w-full ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                            value={customerSearch || customer?.fullname || newCustomer.fullname}
                            onChange={(e) => {
                              const value = e.target.value;

                              clearCustomer();
                              setCustomerSearch(value);

                              setNewCustomer((prev) => ({
                                ...prev,
                                fullname: value,
                              }));
                            }}
                          />
                          {showCustomerDropdown &&
                            customerSearch &&
                            customers?.length > 0 && (
                              <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow z-50 max-h-40 overflow-y-auto">
                                {customers.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      fetchCustomerById(c.id);
                                      setCustomerSearch(c.fullname);
                                      setShowCustomerDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                  >
                                    <p className="font-medium">{c.fullname}</p>
                                    <p className="text-xs text-gray-500">{c.phone}</p>
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>


                      </div>

                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="">Phone</label>
                      <input
                        disabled={!canEditTime}
                        className={`input ${customer?.phone || !canEditTime ? "!bg-gray-200 text-gray-500" : ""}`}
                        value={customer?.phone || newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />

                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="">Email</label>
                      <input
                        disabled={!canEditTime}
                        className={`input ${customer?.email || !canEditTime ? "!bg-gray-200 text-gray-500" : ""}`}
                        value={customer?.email || newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="">Instagram</label>
                      <input
                        disabled={!canEditTime}
                        className={`input ${customer?.instagram || !canEditTime ? "!bg-gray-200 text-gray-500" : ""}`}
                        value={customer?.instagram || newCustomer.instagram}
                        onChange={(e) =>
                          setNewCustomer((prev) => ({
                            ...prev,
                            instagram: e.target.value,
                          }))
                        }
                      />
                    </div> */}
                    <div className="flex flex-col">
                      <label htmlFor="">Date</label>
                      <input
                        type="date"
                        disabled={!canEditTime}
                        value={form.date}
                        onChange={(e) => {
                          const newDate = e.target.value;

                          setForm((prev) => ({
                            ...prev,
                            date: newDate,
                            time: "",
                          }));
                        }}
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                      />

                    </div>
                    <div className="flex flex-col">
                      <label>Time</label>
                      <select
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        value={form.time}
                        disabled={!canEditTime}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Time</option>

                        {reservationLoading && (
                          <option disabled>Loading...</option>
                        )}

                        {!reservationLoading &&
                          availableTimeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label>Category Table</label>

                      <Select
                        options={availableCategories.map(c => ({
                          value: c.id,
                          label: c.name,
                        }))}
                        value={
                          availableCategories
                            .map(c => ({ value: c.id, label: c.name }))
                            .find(option => option.value === selectedCategoryId) || null
                        }
                        onChange={(selected: any) => {
                          setSelectedCategoryId(selected?.value || null);
                        }}
                        isDisabled={!canEditTime || !form.date || !form.time}
                        placeholder="Select category..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label>Table</label>

                      <Select
                        isMulti
                        options={availableTables.map(t => ({
                          value: t.id,
                          label: `${t.number} (${t.covers} Pax)`,
                        }))}
                        value={selectedTables.map(t => ({
                          value: t.id,
                          label: `${t.number} (${t.covers} Pax)`,
                        }))}
                        onChange={(selected: any) => {
                          const tables = selected.map((s: any) =>
                            availableTables.find(t => t.id === s.value)
                          );
                          setSelectedTables(tables.filter(Boolean));
                        }}
                        isDisabled={!canEditTime || !selectedCategoryId}
                        placeholder="Select table..."
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="">Pax</label>
                      <input
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        disabled={!canEditTime}
                        value={form.totalPax}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, totalPax: e.target.value }))
                        }
                      />


                      <label className="flex items-center gap-2 text-sm my-4">
                        <input
                          type="checkbox"
                          checked={isSelectMenu}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsSelectMenu(checked);

                            if (!checked) {
                              // kalau dimatiin → buang semua menu
                              setOrderedMenu([]);
                            }
                          }}
                        />
                        Is Select Menu?
                      </label>


                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={needDp}
                          onChange={(e) => setNeedDp(e.target.checked)}
                        />
                        Need DP?
                      </label>


                    </div>


                    <div className="flex flex-col">
                      <label htmlFor="">Channel</label>
                      <select
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        value={form.channel}
                        disabled={!canEditTime}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            channel: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Channel</option>
                        <option key="instagram" value="instagram">Instagram</option>
                        <option key="whatsapp" value="whatsapp">WhatsApp</option>
                      </select>


                      {canMoney && (
                        <>
                          <label htmlFor="" className="mt-2">Spend Money Amount</label>
                          <input
                            className="input"
                            value={form.spendMoney}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                spendMoney: e.target.value,
                              }))
                            }
                          />
                        </>
                      )}
                    </div>





                    {/* IS SELECT MENU */}
                  </div>

                </div>
                <div className="w-1/3">
                  <div className="grid grid-cols-1 gap-4 text-sm mb-4">
                    <div className="flex flex-col ">
                      <label htmlFor="">Note</label>
                      <textarea
                        disabled={!canEditTime}
                        className={`input min-h-[112px] ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}

                        value={form.note}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, note: e.target.value }))
                        }
                      />

                    </div>
                    {/* <div className="flex flex-col">
                    <label>Time</label>
                    <select
                      className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                      value={form.time}
                      disabled={!canEditTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Time</option>

                      {reservationLoading && (
                        <option disabled>Loading...</option>
                      )}

                      {!reservationLoading &&
                        availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>
                  </div> */}
                    <div className="flex flex-col">
                      <label htmlFor="">Expected Leave Time</label>
                      <select
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        value={form.expectedLeaveTime}
                        disabled={!canEditTime}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            expectedLeaveTime: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Time</option>
                        {timeOptions.map((expectedLeaveTime) => (
                          <option key={expectedLeaveTime} value={expectedLeaveTime}>
                            {expectedLeaveTime}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="">Leave Time</label>
                      <input
                        type="time"
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        disabled={!canEditTime}
                        value={form.leaveTime}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            leaveTime: e.target.value,
                          }))
                        }
                      />

                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="">Reference Number</label>
                      <input
                        className={`input ${!canEditTime ? "!bg-gray-100 cursor-not-allowed" : ""}`}
                        disabled={!canEditTime}
                        value={form.referenceNumber}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                </div>

              </div>


            </div>

            {/* RIGHT – ORDERED MENU */}
            {hasMenu && (
              <div className="w-[400px] bg-white rounded-xl p-4 flex flex-col">
                <h4 className="font-medium mb-3">Ordered Menu</h4>

                {/* LIST MENU */}
                <div className="text-sm flex-1 overflow-y-auto space-y-2">
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
            )}

          </div>

          {needDp && (
            <div className="border-t pt-4 space-y-4">
              <label className="font-semibold block">Down Payment</label>

              {/* TOTAL AUTO (optional tapi bagus 🔥) */}

              <div className="flex flex-col mb-3">
                <label>Total DP</label>

                <input
                  className={`input !bg-gray-100 cursor-not-allowed`}
                  disabled
                  value={form.totalDp}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, totalDp: e.target.value }))
                  }
                />
              </div>



              {/* UPLOAD (CUMA 1) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="font-medium">DP Receipt</label>

                  <div
                    className="relative group cursor-pointer"
                    onClick={() => {
                      const imageUrl = previewUrl || form?.downpaymentProof;
                      if (imageUrl) window.open(imageUrl, "_blank");
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        className="w-full h-60 object-cover rounded border"
                      />
                    ) : form?.downpaymentProof ? (
                      <img
                        src={form.downpaymentProof}
                        className="w-full h-60 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-full h-60 flex items-center justify-center rounded border bg-gray-100 text-gray-400 text-sm">
                        No Photo
                      </div>
                    )}

                    {(previewUrl || form?.downpaymentProof) && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded">
                        <span className="text-white text-sm">View Photo</span>
                      </div>
                    )}
                  </div>



                  <button
                    type="button"
                    onClick={() => {
                      if (!canSaveDp || isDpLocked) return;
                      fileInputRef.current?.click();
                    }}
                    disabled={!canSaveDp || isDpLocked}
                    className={`
    px-3 py-1 text-sm text-white w-fit border self-end rounded hidden
    ${!canSaveDp || isDpLocked
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/80"}
  `}
                  >
                    Upload
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setDpFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                {/* 5 AMOUNT FIELD */}
                <div className="grid grid-cols-1 gap-3">
                  {dpAmounts.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 items-end">

                      {/* AMOUNT */}
                      <div className="flex flex-col">
                        <label className="text-xs">DP {index + 1} Amount</label>
                        <input
                          className={`
            input
            ${!canSaveDp ? "!bg-gray-100 cursor-not-allowed text-gray-500" : ""}
          `}
                          placeholder="Amount"
                          value={item.amount}
                          disabled={!canSaveDp || isDpLocked}
                          onChange={(e) => {
                            if (!canSaveDp) return;
                            handleDpAmountChange(index, e.target.value);
                          }}
                        />
                      </div>

                      {/* DATE */}
                      <div className="flex flex-col">
                        <label className="text-xs">Date</label>
                        <input
                          type="date"
                          className={`
            input
            ${!canSaveDp ? "!bg-gray-100 cursor-not-allowed text-gray-500" : ""}
          `}
                          value={item.date}
                          disabled={!canSaveDp || isDpLocked}
                          onChange={(e) => {
                            if (!canSaveDp) return;
                            handleDpDateChange(index, e.target.value);
                          }}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-6 border rounded-lg px-3 py-2">

                {/* LEFT: CHECKBOX */}
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isDpCompleted}
                    disabled={!canSaveDp || isDpLocked}
                    onChange={(e) => {
                      if (!canSaveDp || isDpLocked) return;
                      setIsDpCompleted(e.target.checked);
                    }}
                    className="w-4 h-4 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                  DP Completed
                </label>

                {/* RIGHT: BUTTON */}
                <button
                  type="button"
                  disabled={!canSaveDp || isDpLocked} 
                  onClick={() => {
                    if (!canSaveDp || isDpLocked) return;
                    setConfirmModalOpen(true); // 🔥 buka modal
                  }}
                  className={`
    px-3 py-1 text-sm text-white rounded hidden
    ${!canSaveDp || isDpLocked
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/80"
                    }
  `}
                >
                  {isDpLocked ? "Updated" : "Update DP Status"}
                </button>
              </div>
            </div>
          )}

        </div>

        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 w-[350px] shadow-lg">

              <h2 className="text-lg font-semibold mb-2">
                Confirm Update
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to update DP status?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      if (!detail?.id) return;

                      const formData = buildDpFormData();

                      await updateBookingDp(detail.id, formData);
                      if (isDpCompleted) {
                        setIsDpLocked(true);
                      }

                      setConfirmModalOpen(false);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}


        <div className="flex items-end">


          {/* STATUS */}
          <div className="w-[45%]">
            <label htmlFor="">Status</label>
            <div className="grid grid-cols-3 gap-2 flex-wrap">
              {STATUS_LIST.map((s) => {
                const isCompleted = s.value === "completed";
                const disabledCompleted =
                  isCompleted && !isBookingTimePassed();

                return (
                  <button
                    key={s.value}
                    disabled={disabledCompleted}
                    onClick={() => {
                      if (disabledCompleted) return;
                      setStatus(s.value);
                    }}
                    className={`px-4 py-1 rounded-md text-sm
        ${status === s.value
                        ? "bg-[#a38f63] text-white"
                        : "bg-white border"}
        ${disabledCompleted ? "opacity-50 cursor-not-allowed" : ""}
      `}
                  >
                    {s.label}
                  </button>
                );
              })}

            </div>
          </div>

          {/* CLOSE */}
          <div className="w-[55%] flex justify-end gap-4">
            <button
              onClick={() => {  // 🔥 fetch tanpa search
                onClose();                // tutup modal
              }}
              className="px-4 py-2 bg-white rounded shadow text-sm"
            >
              Close
            </button>
            {canSave && (

              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded shadow text-sm text-white hidden
      ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary"}
    `}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}

          </div>

        </div>
      </div>

      <AddMenuModal
        open={showAddMenu}
        initialSelected={orderedMenu}   // 🔥 kirim menu existing
        onClose={() => setShowAddMenu(false)}
        onSave={(newMenu: any[]) => {
          setOrderedMenu(newMenu);
          setIsSelectMenu(true);
        }}
      />

      {/* INPUT STYLE */}
      <style>{`
          .input {
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
        `}</style>
    </div>
  );
}
