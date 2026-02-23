import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import AppComponent from "./AppComponent";
import { FaDownload } from "react-icons/fa";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import MarketplaceBrowseView from "./MarketplaceBrowseView";
import { get, post } from "../utils/api";
import { fetchAppManifest, fetchCurated, getTaggedRepos } from "../utils/githubApi";


// Mock types (adjust based on actual API response)
type AppInfo = {
  id: string;
  name: string;
  isEnabled: boolean;
  imageURL?: string;
};

type CardItem = {
  title: string;
  subtitle?: string;
  description?: string;
  imageURL?: string;
  authors?: { name: string; url?: string }[];
  tags?: string[];
  stargazers_count?: number;
  lastUpdated?: string;
  created?: string;
  installed?: boolean;
  user?: string;
  repo?: string;
  branch?: string;
  manifest?: any;
};

export default function MarketplaceApps({
  onDirtyChange,
  resetKey,
  snapshotKey,
}: {
  onDirtyChange: (dirty: boolean) => void;
  resetKey: number;
  snapshotKey: number;
}) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [browsingContent, setBrowsingContent] = useState(false);
  const [communityApps, setCommunityApps] = useState<CardItem[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [installingIndex, setInstallingIndex] = useState<number | null>(null);
  const [infoIndex, setInfoIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const captureBaselineRef = useRef(true);
  const baselineRef = useRef<Map<string, boolean> | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const observer = useRef<IntersectionObserver>(null);

  const fetchCommunityApps = async (loadMore = false) => {
    const targetPage = loadMore ? page + 1 : 1;
    if (targetPage === 1) {
      setCommunityLoading(true);
      setCommunityApps([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    setCommunityError(null);

    try {
      const pageOfRepos = await getTaggedRepos("spicetify-apps", targetPage, [], false);
      const results = await Promise.allSettled(
        pageOfRepos.items.map((repo: any) =>
          fetchAppManifest(repo.contents_url, repo.default_branch, repo.stargazers_count).then(
            (apps) =>
              apps?.map((a) => ({
                ...a,
                archived: repo.archived,
                lastUpdated: repo.pushed_at,
                created: repo.created_at,
              })) || [],
          ),
        ),
      );
      const allApps: CardItem[] = [];
      const currentApps = apps;
      for (const result of results) {
        if (result.status === "fulfilled" && result.value.length) {
          allApps.push(
            ...result.value.map((a: any) => ({
              ...a,
              installed: currentApps.some((ia) => ia.name === a.title),
            })),
          );
        }
      }

      if (targetPage === 1) {
        const curated = await fetchCurated();
        const curatedApps = curated.apps
          .filter((c: any) => !allApps.some((a) => a.user === c.user && a.repo === c.repo))
          .map((c: any) => ({ ...c, installed: currentApps.some((ia) => ia.name === c.title) }));
        setCommunityApps([...curatedApps, ...allApps]);
      } else {
        setCommunityApps((prev) => [...prev, ...allApps]);
      }
      setPage(targetPage);
      if (pageOfRepos.items.length === 0 || pageOfRepos.items.length < 30) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch community apps:", err);
      setCommunityError(err.message?.includes("403") ? "GitHub API rate limit reached. Try again later." : "Failed to load community apps.");
    } finally {
      if (targetPage === 1) {
        setCommunityLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const fetchApps = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const fetchedApps = await get("/apps"); // Assuming a /apps endpoint
      setApps(fetchedApps);
    } catch (err: any) {
      if (!silent) setError(err.message || "Failed to fetch apps.");
      console.error("Error fetching apps:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Sync from global context → local state + baseline / dirty check
  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (browsingContent) {
      fetchCommunityApps();
    }
  }, [browsingContent]);

  useEffect(() => {
    if (communityApps.length > 0) {
      setCommunityApps((prev) =>
        prev.map((ca) => ({
          ...ca,
          installed: apps.some((ia) => ia.name === ca.title),
        })),
      );
    }
  }, [apps]);

  // Recapture baseline after Apply
  useEffect(() => {
    if (snapshotKey === 0) return;
    captureBaselineRef.current = true;
    fetchApps(true);
  }, [snapshotKey]);

  // Undo toggle changes on Reset
  useEffect(() => {
    if (resetKey === 0 || !baselineRef.current) return;
    const baseline = new Map(baselineRef.current);
    (async () => {
      try {
        // const current = await backend.GetSpicetifyApps();
        // for (const app of current) {
        //   const baselineEnabled = baseline.get(app.id);
        //   if (baselineEnabled === undefined) {
        //     // Installed after baseline – delete it
        //     await backend.DeleteSpicetifyApp(app.id);
        //   } else if (app.isEnabled !== baselineEnabled) {
        //     // Toggle state changed – restore it
        //     await backend.ToggleSpicetifyApp(app.id, baselineEnabled);
        //   }
        // }
        // await fetchApps(true);
      } catch (err) {
        console.error("[MarketplaceApps] Reset failed:", err);
      }
    })();
  }, [resetKey]);

  const handleToggleApp = async (appId: string, enable: boolean) => {
    setTogglingId(appId);
    setApps((prevApps) => prevApps.map((app) => (app.id === appId ? { ...app, isEnabled: enable } : app)));

    try {
      const response = await post("/toggleApp", { appId, enable });
      if (response.success) {
        fetchApps(true);
      } else {
        setApps((prevApps) => prevApps.map((app) => (app.id === appId ? { ...app, isEnabled: !enable } : app)));
        alert(`Failed to toggle app: ${appId}`);
      }
    } catch (err: any) {
      console.error(`Error toggling app ${appId}:`, err);
      setApps((prevApps) => prevApps.map((app) => (app.id === appId ? { ...app, isEnabled: !enable } : app)));
      alert(`Error toggling app: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteApp = (appId: string) => {
    const appName = apps.find((a) => a.id === appId)?.name || appId;
    setPendingDelete({ id: appId, name: appName });
  };

  const confirmDeleteApp = async () => {
    if (!pendingDelete) return;
    const { id: appId } = pendingDelete;
    setPendingDelete(null);
    setTogglingId(appId);
    try {
      const response = await post("/deleteApp", { appId });
      if (response.success) {
        fetchApps(true);
      } else {
        alert(`Failed to delete app: ${appId}`);
      }
    } catch (err: any) {
      console.error(`Error deleting app ${appId}:`, err);
      alert(`Error deleting app: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleInstallApp = async (app: CardItem, index: number) => {
    if (app.installed) return;
    setInstallingIndex(index);
    setInfoIndex(null);
    try {
      const appName = app.title.replace(/[^a-zA-Z0-9_-]/g, "_");
      const meta = {
        name: app.title,
        description: app.subtitle,
        imageURL: app.imageURL,
        authors: app.authors,
        tags: app.tags,
        stars: app.stargazers_count,
        subdir: (app.manifest as any)?.subdir || "",
      };
      const response = await post("/installMarketplaceApp", { user: app.user, repo: app.repo, appName, branch: app.branch, meta: JSON.stringify(meta) });
      if (response.message) {
        setCommunityApps((prev) => prev.map((e, i) => (i === index ? { ...e, installed: true } : e)));
        fetchApps(true);
      } else {
        alert(`Failed to install ${app.title}`);
      }
    } catch (err: any) {
      alert(`Error installing ${app.title}: ${err.message}`);
    } finally {
      setInstallingIndex(null);
    }
  };

  const sortTags = ["Popular", "Newest", "Recently Updated"] as const;
  const contentTags = ["Stats", "Library", "Utility", "Official"] as const;
  const smartTags = [...sortTags, ...contentTags];

  const filteredApps = useMemo(() => {
    let result = communityApps.map((item, idx) => ({ item, origIdx: idx }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        ({ item }) =>
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.user?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    const activeContentTags = selectedTags.filter((t) => (contentTags as readonly string[]).includes(t));
    if (activeContentTags.length > 0) {
      result = result.filter(
        ({ item }) => Array.isArray(item.tags) && activeContentTags.every((tag) => item?.tags?.some((tt) => tt.toLowerCase() === tag.toLowerCase())),
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
  }, [communityApps, searchQuery, selectedTags]);

  const lastAppElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (communityLoading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCommunityApps(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [communityLoading, loadingMore, hasMore],
  );

  return browsingContent ? (
    <MarketplaceBrowseView
      title="Browsing Community Apps"
      searchPlaceholder="Search apps..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onBack={() => setBrowsingContent(false)}
      allTags={smartTags}
      sortTags={sortTags}
      selectedTags={selectedTags}
      onTagsChange={setSelectedTags}
      error={communityError}
      onRetry={fetchCommunityApps}
      loading={communityLoading}
      loadingLabel="Fetching Apps"
      emptyLabel="No community apps found."
      items={filteredApps}
      allItems={communityApps}
      installingIndex={installingIndex}
      onInstall={handleInstallApp}
      loadingMore={loadingMore}
      lastItemRef={lastAppElementRef}
      infoIndex={infoIndex}
      onInfo={setInfoIndex}
      onInfoClose={() => setInfoIndex(null)}
    />
  ) : (
    <>
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Installed Apps</h1>
            <p className="text-[#a0a0a0]">Manage your Spicetify custom apps.</p>
          </div>
          <button
            onClick={() => setBrowsingContent(true)}
            className="flex h-8 w-fit items-center gap-2 rounded-full bg-[#d63c6a] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#c52c5a] active:bg-[#b51c4a]"
          >
            Browse content
            <FaDownload />
          </button>
        </div>
        {loading && <p className="text-[#a0a0a0]">Loading apps...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
            {apps.length > 0 ? (
              apps.map((app) => (
                <AppComponent
                  key={app.id}
                  name={app.name}
                  appId={app.id}
                  isEnabled={app.isEnabled}
                  onToggle={handleToggleApp}
                  onDelete={handleDeleteApp}
                  isToggling={togglingId === app.id}
                  imageURL={app.imageURL}
                />
              ))
            ) : (
              <p className="text-[#a0a0a0]">No apps found.</p>
            )}
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        show={!!pendingDelete}
        itemName={pendingDelete?.name || ""}
        itemType="app"
        onConfirm={confirmDeleteApp}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}