import { useState } from "react";
import TableAreaTab from "../components/organisms/TableAreaTab";
import TableNumberTab from "../components/organisms/TableNumberTab";
import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";

export default function TableManagement() {
  
  const [activeTab, setActiveTab] = useState<"area" | "table">("area");
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
            <h1 className="m-4 text-2xl font-bold">Table Management</h1>
            <div className="flex flex-col h-fit">
              {/* TAB HEADER */}
              <div className="flex gap-2 border-b-2 pb-4 px-4">
                <button
                  onClick={() => setActiveTab("area")}
                  className={`px-10 py-2 text-xs
            ${activeTab === "area"
                      ? "border-b-2 bg-primary text-white"
                      : "text-primary border-primary border-2"
                    }`}
                >
                  Table Area
                </button>

                <button
                  onClick={() => setActiveTab("table")}
                  className={`px-8 py-2 text-xs
            ${activeTab === "table"
                      ? "border-b-2 bg-primary text-white"
                      : "text-primary border-primary border-2"
                    }`}
                >
                  Table Number
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "area" && <TableAreaTab />}
                {activeTab === "table" && <TableNumberTab />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
