import { useState } from "react";
import MenuCategoryTab from "../components/organisms/MenuCategoryTab";
import MenuListTab from "../components/organisms/MenuListTab";
import Sidebar from "../components/molecules/Sidebar";
import Header from "../components/molecules/Header";

export default function MenuManagement() {
  
  const [activeTab, setActiveTab] = useState<"category" | "menu">("category");
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
            <h1 className="m-4 text-2xl font-bold">Menu Management</h1>
            <div className="flex flex-col h-fit">
              {/* TAB HEADER */}
              <div className="flex gap-2 border-b-2 pb-4 px-4">
                <button
                  onClick={() => setActiveTab("category")}
                  className={`px-5 py-2 text-xs
            ${activeTab === "category"
                      ? "border-b-2 bg-primary text-white"
                      : "text-primary border-primary border-2"
                    }`}
                >
                  Category
                </button>

                <button
                  onClick={() => setActiveTab("menu")}
                  className={`px-8 py-2 text-xs
            ${activeTab === "menu"
                      ? "border-b-2 bg-primary text-white"
                      : "text-primary border-primary border-2"
                    }`}
                >
                  Menu
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "category" && <MenuCategoryTab />}
                {activeTab === "menu" && <MenuListTab />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
