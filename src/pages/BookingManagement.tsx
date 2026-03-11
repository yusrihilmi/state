import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";
import BookingManagementTab from "../components/organisms/BookingManagementTab";

export default function BookingManagement() {
  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <Header />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* CONTENT */}
        <main className="flex-1 bg-[#EAEAEA] p-4 flex gap-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg overflow-y-auto">
            <h1 className="m-4 text-2xl font-bold">Booking Management</h1>
            <div className="flex flex-col h-fit">

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-hidden">
                <BookingManagementTab/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
