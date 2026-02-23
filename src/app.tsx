import React, { useEffect, useState } from "react";
import { FaAppStore, FaCog, FaDownload, FaFlag, FaHome, FaPalette, FaPuzzlePiece } from "react-icons/fa";
import Dashboard from "./components/Dashboard";
import Topbar from "./components/Topbar";
import MarketplaceAddons from "./components/MarketplaceAddons";
import MarketplaceThemes from "./components/MarketplaceThemes";
import MarketplaceApps from "./components/MarketplaceApps";
import Settings from "./components/Settings";
import { get, post } from "./utils/api";
import { SpicetifyProvider, useSpicetify } from "./context/SpicetifyContext";

function MainAppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDirty, setIsDirty] = useState(false);
  const [snapshotKey, setSnapshotKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const { refreshAll } = useSpicetify();

  const handleDirtyChange = (dirty: boolean) => {
    setIsDirty(dirty);
  };

  const handleApply = async () => {
    try {
      await post("/apply", {}); // Call the backend apply endpoint
      setSnapshotKey((prev) => prev + 1);
      setIsDirty(false);
      refreshAll(); // Refresh all data after apply
    } catch (error) {
      console.error("Failed to apply changes:", error);
      alert("Failed to apply changes.");
    }
  };

  const handleReset = async () => {
    try {
      await post("/reset", {}); // Call the backend reset endpoint
      setResetKey((prev) => prev + 1);
      setIsDirty(false);
      refreshAll(); // Refresh all data after reset
    } catch (error) {
      console.error("Failed to reset changes:", error);
      alert("Failed to reset changes.");
    }
  };

  return (
    <>
      <div className="relative flex h-full w-full flex-col">
        <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === "addons" && (
              <MarketplaceAddons onDirtyChange={handleDirtyChange} resetKey={resetKey} snapshotKey={snapshotKey} />
            )}
            {activeTab === "themes" && (
              <MarketplaceThemes onDirtyChange={handleDirtyChange} resetKey={resetKey} snapshotKey={snapshotKey} />
            )}
            {activeTab === "apps" && (
              <MarketplaceApps onDirtyChange={handleDirtyChange} resetKey={resetKey} snapshotKey={snapshotKey} />
            )}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
        {isDirty && (
          <div className="flex w-full justify-between p-4 bg-gray-800 text-white">
            <span>You have pending changes.</span>
            <div>
              <button onClick={handleReset} className="mr-2 px-3 py-1 bg-gray-600 rounded">Reset</button>
              <button onClick={handleApply} className="px-3 py-1 bg-blue-600 rounded">Apply</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <SpicetifyProvider>
      <MainAppContent />
    </SpicetifyProvider>
  );
}
