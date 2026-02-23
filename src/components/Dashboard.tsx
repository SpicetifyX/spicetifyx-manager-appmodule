import React from "react";
import { FaCheckCircle, FaPuzzlePiece, FaPalette, FaAppStore, FaChevronRight } from "react-icons/fa";

export default function Dashboard({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-[#171b20] p-5">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">Overview of your Spicetify installation</p>
      </div>

        <div className="flex flex-1 flex-col space-y-4">
          <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#121418] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <>
                    <FaCheckCircle className="h-7 w-7 text-[#d63c6a]" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Everything's Running</h2>
                      <p className="text-sm text-[#a0a0a0]">Spicetify is active and patched</p>
                    </div>
                  </>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate?.("addons")}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#121418] p-2 text-left transition-all hover:border-[#d63c6a] hover:shadow-lg hover:shadow-[#d63c6a]/10 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaPuzzlePiece className="h-4 w-4 text-[#d63c6a]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">Extensions</p>
                </div>
                <FaChevronRight className="h-3 w-3 text-[#333] transition-colors group-hover:text-[#d63c6a]" />
              </div>
              <div className="mt-1.5 flex-1">
                <p className="text-3xl font-bold text-white">-</p>
                <p className="mt-1 text-sm text-[#a0a0a0]">- active</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                <div
                  className="h-full bg-[#d63c6a] transition-all duration-500"
                  style={{
                    width: "100%",
                  }}
                ></div>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.("themes")}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#121418] p-2 text-left transition-all hover:border-[#d63c6a] hover:shadow-lg hover:shadow-[#d63c6a]/10 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaPalette className="h-4 w-4 text-[#d63c6a]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">Themes</p>
                </div>
                <FaChevronRight className="h-3 w-3 text-[#333] transition-colors group-hover:text-[#d63c6a]" />
              </div>
              <div className="mt-1.5 flex-1">
                <p className="text-3xl font-bold text-white">-</p>
                <p className="mt-1 text-sm text-[#a0a0a0]">Available</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                <div className="h-full w-full bg-gradient-to-r from-[#d63c6a] to-[#c52c5a] transition-all duration-500"></div>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.("apps")}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#121418] p-2 text-left transition-all hover:border-[#d63c6a] hover:shadow-lg hover:shadow-[#d63c6a]/10 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaAppStore className="h-4 w-4 text-[#d63c6a]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">Apps</p>
                </div>
                <FaChevronRight className="h-3 w-3 text-[#333] transition-colors group-hover:text-[#d63c6a]" />
              </div>
              <div className="mt-1.5 flex-1">
                <p className="text-3xl font-bold text-white">-</p>
                <p className="mt-1 text-sm text-[#a0a0a0]">- active</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                <div
                  className="h-full bg-[#d63c6a] transition-all duration-500"
                  style={{
                    width: "100%",
                  }}
                ></div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#2a2a2a] bg-[#121418] p-4 transition-all">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#d63c6a]">Spotify Client</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[#0a0c0f]/45 p-3">
                  <span className="text-sm text-[#a0a0a0]">Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Installed
                      </>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0a0c0f]/45 p-3">
                  <span className="text-sm text-[#a0a0a0]">Version</span>
                  <span className="text-sm font-semibold text-white">-</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#2a2a2a] bg-[#121418] p-4 transition-all">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#d63c6a]">Spicetify CLI</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[#0a0c0f]/45 p-3">
                  <span className="text-sm text-[#a0a0a0]">Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Installed
                      </>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0a0c0f]/45 p-3">
                  <span className="text-sm text-[#a0a0a0]">Version</span>
                  <span className="text-sm font-semibold text-white">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
