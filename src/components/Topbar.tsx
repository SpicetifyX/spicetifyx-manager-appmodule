import React, { useEffect } from "react";
import { FaAppStore, FaCog, FaFlag, FaHome, FaPalette, FaPuzzlePiece } from "react-icons/fa";

export default function Topbar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  useEffect(() => {
    const el = document.querySelector(".main-topBar-container") as HTMLElement;
    console.log(el);
    if (el) {
      el.style.position = "relative";
      el.style.height = "0px";
    }
  }, []);

  return (
    <div className="flex w-full h-16 items-center bg-[#121418] p-4">
      <button
        className={`flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "dashboard" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2e34]"}`}
        onClick={() => setActiveTab("dashboard")}
      >
        <FaHome size={20} />
      </button>
      <button
        className={`ml-2 flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "addons" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2e34]"}`}
        onClick={() => setActiveTab("addons")}
      >
        <FaPuzzlePiece size={20} />
      </button>
      <button
        className={`ml-2 flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "themes" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2a2a]"}`}
        onClick={() => setActiveTab("themes")}
      >
        <FaPalette size={20} />
      </button>
      <button
        className={`ml-2 flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "apps" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2a2a]"}`}
        onClick={() => setActiveTab("apps")}
      >
        <FaAppStore size={20} />
      </button>
      <div className="ml-auto flex items-center  gap-2">
        <button
          title="Report missing listing"
          className={`flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "submit" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2a2a]"}`}
          onClick={() => setActiveTab("submit")}
        >
          <FaFlag size={18} />
        </button>
        <button
          className={`flex items-center justify-center rounded-full px-3 py-3 ${activeTab === "settings" ? "bg-[#d63c6a] text-white" : "text-[#a0a0a0] hover:bg-[#2a2a2a]"}`}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog size={20} />
        </button>
      </div>
    </div>
  );
}
