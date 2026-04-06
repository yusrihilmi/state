import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";
import UserTab from "../components/organisms/UserTab";

export default function UserManagement() {
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
            <h1 className="m-4 text-2xl font-bold">User Management</h1>
            <div className="flex flex-col h-fit">

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-hidden">
                <UserTab/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
