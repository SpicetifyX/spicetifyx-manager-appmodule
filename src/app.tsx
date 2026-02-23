import React, { useEffect, useState } from "react";
import { FaAppStore, FaCog, FaDownload, FaFlag, FaHome, FaPalette, FaPuzzlePiece } from "react-icons/fa";
import Dashboard from "./components/Dashboard";
import Addon from "./components/Addon";
import Topbar from "./components/Topbar";

export default function App() {
  const [installedExtensions, setInstalledExtensions] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  async function fetchInstalledExtensions() {
    const resp = await fetch("http://localhost:8000/extensions");
    setInstalledExtensions(await resp.json());
  }
  useEffect(() => {
    fetchInstalledExtensions();
  }, []);

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <div className="relative flex h-full w-full flex-col">
        <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
            {activeTab.includes("addons") && (
              <div className={activeTab === "addons" ? "h-full" : "hidden"}>
                <div className="flex h-full flex-col p-4">
                  <div className="mb-6 flex w-full items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Installed Addons</h1>
                      <p className="text-[#a0a0a0]">Manage your Spicetify extensions.</p>
                    </div>
                    <button className="flex h-8 w-fit items-center gap-2 rounded-full bg-[#d63c6a] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#c52c5a] active:bg-[#b51c4a]">
                      Browse content
                      <FaDownload />
                    </button>
                  </div>

                  <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
                    {installedExtensions && installedExtensions.length > 0 ? (
                      installedExtensions.map((addon) => (
                        <>
                          <Addon
                            key={addon.name}
                            name={addon.name}
                            description={addon.description}
                            isEnabled={addon.isEnabled}
                            onToggle={() => {}}
                            onDelete={() => {}}
                            preview={addon.imageURL ? addon.imageURL : undefined}
                            isToggling={false}
                            addonFileName={addon.addonFileName}
                            authors={addon.authors}
                            tags={addon.tags}
                          />
                        </>
                      ))
                    ) : (
                      <p className="text-[#a0a0a0]">No addons found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab.includes("themes") && (
              <div className={activeTab === "themes" ? "h-full" : "hidden"}>
                {/* <MarketplaceThemes onDirtyChange={(d) => setThemesDirty(d)} resetKey={resetKey} snapshotKey={snapshotKey} /> */}
              </div>
            )}
            {activeTab.includes("apps") && (
              <div className={activeTab === "apps" ? "h-full" : "hidden"}>
                {/* <MarketplaceApps onDirtyChange={(d) => setAppsDirty(d)} resetKey={resetKey} snapshotKey={snapshotKey} /> */}
              </div>
            )}
            {activeTab === "settings" && <div className="h-full"></div>}
          </div>
        </div>
      </div>
    </>
  );
}
