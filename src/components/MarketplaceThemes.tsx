import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Theme from "./Theme";
import { FaDownload } from "react-icons/fa";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import MarketplaceBrowseView from "./MarketplaceBrowseView";
import { get, post } from "../utils/api";

type ThemeInfo = any;
type CardItem = any;

export default function MarketplaceThemes({
  resetKey,
  snapshotKey,
}: {
  onDirtyChange: (dirty: boolean) => void;
  resetKey: number;
  snapshotKey: number;
}) {
  const contextThemes: ThemeInfo[] = [];
  const themesLoaded = true;

  const [themes, setThemes] = useState<ThemeInfo[]>(contextThemes);
  const [loading, setLoading] = useState(!themesLoaded);
  const [error, setError] = useState<string | null>(null);
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null);
  const [browsingContent, setBrowsingContent] = useState(false);
  const [communityThemes, setCommunityThemes] = useState<CardItem[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [installingIndex, setInstallingIndex] = useState<number | null>(null);
  const [infoIndex, setInfoIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const themesRef = useRef<ThemeInfo[]>([]);
  const captureBaselineRef = useRef(true);
  const baselineRef = useRef<{ activeThemeId: string; colorScheme: string; installedIds: string[] } | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchCommunityThemes = async (loadMore = false) => {
    //...
  };

  const fetchThemes = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const fetchedThemes = await get("/themes"); // Assuming a /themes endpoint
      setThemes(fetchedThemes);
    } catch (err: any) {
      if (!silent) setError(err.message || "Failed to fetch themes.");
      console.error("Error fetching themes:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Sync from global context → local state + baseline / dirty check
  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    if (browsingContent) {
      fetchCommunityThemes();
    }
  }, [browsingContent]);

  useEffect(() => {
    if (communityThemes.length > 0) {
      setCommunityThemes((prev) =>
        prev.map((ct) => ({
          ...ct,
          installed: themes.some((t) => t.name === ct.title),
        })),
      );
    }
  }, [themes]);

  // Recapture baseline after Apply
  useEffect(() => {
    if (snapshotKey === 0) return;
    captureBaselineRef.current = true;
    fetchThemes(true);
  }, [snapshotKey]);

  // Undo theme/scheme changes on Reset
  useEffect(() => {
    if (resetKey === 0 || !baselineRef.current) return;
    const { activeThemeId, colorScheme, installedIds } = baselineRef.current;
    (async () => {
      try {
        // const current = await backend.GetSpicetifyThemes(); // This will be replaced later
        // const baselineInstalled = new Set(installedIds);
        // // Delete themes that were installed after the baseline was captured
        // for (const theme of current) {
        //   if (!baselineInstalled.has(theme.id)) {
        //     await backend.DeleteSpicetifyTheme(theme.id);
        //   }
        // }
        // // Re-fetch after deletions to restore active theme / color scheme
        // const afterDelete = await backend.GetSpicetifyThemes(); // This will be replaced later
        // const activeTheme = afterDelete.find((t) => t.isActive);
        // const currentId = activeTheme?.id ?? "";
        // const currentScheme = activeTheme?.activeColorScheme ?? "";
        // if (currentId !== activeThemeId) {
        //   if (activeThemeId) await backend.ApplySpicetifyTheme(activeThemeId); // This will be replaced later
        // } else if (currentScheme !== colorScheme) {
        //   await backend.SetColorScheme(activeThemeId, colorScheme); // This will be replaced later
        // }
        // await fetchThemes(true);
      } catch (err) {
        console.error("[MarketplaceThemes] Reset failed:", err);
      }
    })();
  }, [resetKey]);

  const handleSelectTheme = async (themeId: string) => {
    setApplyingThemeId(themeId);
    try {
      const response = await post("/applyTheme", { themeId });
      if (response.success) {
        fetchThemes(true);
      } else {
        alert(`Failed to apply theme: ${themeId}`);
      }
    } catch (err: any) {
      console.error(`Error applying theme ${themeId}:`, err);
      alert(`Error applying theme: ${err.message}`);
    } finally {
      setApplyingThemeId(null);
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    const themeName = themes.find((t) => t.id === themeId)?.name || themeId;
    setPendingDelete({ id: themeId, name: themeName });
  };

  const confirmDeleteTheme = async () => {
    if (!pendingDelete) return;
    const { id: themeId, name: themeName } = pendingDelete;
    setPendingDelete(null);
    try {
      const response = await post("/deleteTheme", { themeId });
      if (response.success) {
        fetchThemes(true);
        setCommunityThemes((prev) => prev.map((t) => (t.title === themeName ? { ...t, installed: false } : t)));
      } else {
        alert(`Failed to delete theme: ${themeName}`);
      }
    } catch (err: any) {
      alert(`Error deleting theme: ${err.message}`);
    }
  };

  const handleInstallTheme = async (ext: CardItem, index: number) => {
    if (!ext.cssURL || ext.installed) return;
    setInstallingIndex(index);
    setInfoIndex(null);
    try {
      const themeId = ext.title.replace(/[^a-zA-Z0-9_-]/g, "_");
      const meta = {
        name: ext.title,
        description: ext.subtitle,
        imageURL: ext.imageURL,
        authors: ext.authors,
        tags: ext.tags,
        stars: ext.stargazers_count,
      };
      const response = await post("/installMarketplaceTheme", {
        themeId,
        cssURL: ext.cssURL,
        schemesURL: ext.schemesURL,
        include: ext.include,
        meta: JSON.stringify(meta),
      });
      if (response.message) {
        setCommunityThemes((prev) => prev.map((e, i) => (i === index ? { ...e, installed: true } : e)));
        fetchThemes(true);
      } else {
        alert(`Failed to install ${ext.title}`);
      }
    } catch (err: any) {
      alert(`Error installing ${ext.title}: ${err.message}`);
    } finally {
      setInstallingIndex(null);
    }
  };

  const sortTags = ["Popular", "Newest", "Recently Updated"] as const;
  const contentTags = ["Hazy", "Transparent", "Dark", "Minimal", "Official"] as const;
  const smartTags = [...sortTags, ...contentTags];

  const filteredThemes = useMemo(() => {
    let result = communityThemes.map((item, idx) => ({ item, origIdx: idx }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        ({ item }) =>
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.user?.toLowerCase().includes(q) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    const activeContentTags = selectedTags.filter((t) => (contentTags as readonly string[]).includes(t));
    if (activeContentTags.length > 0) {
      result = result.filter(
        ({ item }) => Array.isArray(item.tags) && activeContentTags.every((tag) => item.tags.some((tt) => tt.toLowerCase() === tag.toLowerCase())),
      );
    }
    if (selectedTags.includes("Popular")) {
      result.sort((a, b) => (b.item.stargazers_count || 0) - (a.item.stargazers_count || 0));
    } else if (selectedTags.includes("Newest")) {
      result.sort((a, b) => new Date(b.item.created || 0).getTime() - new Date(a.item.created || 0).getTime());
    } else if (selectedTags.includes("Recently Updated")) {
      result.sort((a, b) => new Date(b.item.lastUpdated || 0).getTime() - new Date(a.item.lastUpdated || 0).getTime());
    }
    return result;
  }, [communityThemes, searchQuery, selectedTags]);

  const observer = useRef<IntersectionObserver>();
  const lastThemeElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (communityLoading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCommunityThemes(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [communityLoading, loadingMore, hasMore],
  );

  return browsingContent ? (
    <MarketplaceBrowseView
      title="Browsing Community Themes"
      searchPlaceholder="Search themes..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onBack={() => setBrowsingContent(false)}
      allTags={smartTags}
      sortTags={sortTags}
      selectedTags={selectedTags}
      onTagsChange={setSelectedTags}
      error={communityError}
      onRetry={fetchCommunityThemes}
      loading={communityLoading}
      loadingLabel="Fetching Themes"
      emptyLabel="No community themes found."
      items={filteredThemes}
      allItems={communityThemes}
      installingIndex={installingIndex}
      onInstall={handleInstallTheme}
      loadingMore={loadingMore}
      lastItemRef={lastThemeElementRef}
      infoIndex={infoIndex}
      onInfo={setInfoIndex}
      onInfoClose={() => setInfoIndex(null)}
    />
  ) : (
    <>
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Installed Themes</h1>
            <p className="text-[#a0a0a0]">Select a theme for your Spotify client.</p>
          </div>
          <button
            onClick={() => setBrowsingContent(true)}
            className="flex h-8 w-fit items-center gap-2 rounded-full bg-[#d63c6a] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#c52c5a] active:bg-[#b51c4a]"
          >
            Browse content
            <FaDownload />
          </button>
        </div>

        {loading && <p className="text-[#a0a0a0]">Loading themes...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
            {themes.length > 0 ? (
              themes.map((theme, idx) => (
                <Theme
                  key={idx}
                  theme={theme}
                  onSelect={handleSelectTheme}
                  onDelete={!theme.isBundled ? handleDeleteTheme : undefined}
                  isApplying={applyingThemeId === theme.id}
                  markDirty={() => fetchThemes(true)}
                />
              ))
            ) : (
              <p className="text-[#a0a0a0]">No themes found.</p>
            )}
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        show={!!pendingDelete}
        itemName={pendingDelete?.name || ""}
        itemType="theme"
        onConfirm={confirmDeleteTheme}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
