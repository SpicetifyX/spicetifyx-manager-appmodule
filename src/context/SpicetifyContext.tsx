import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { get, post } from "../utils/api";

// Define types for your data
interface AddonInfo {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  addonFileName: string;
  preview?: string;
  authors?: { name: string; url?: string }[];
  tags?: string[];
}

interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isBundled: boolean;
  colorSchemes?: string[];
  activeColorScheme?: string;
  preview?: string;
  authors?: { name: string; url?: string }[];
  tags?: string[];
}

interface AppInfo {
  id: string;
  name: string;
  isEnabled: boolean;
  imageURL?: string;
}

interface SpicetifyContextType {
  extensions: AddonInfo[];
  themes: ThemeInfo[];
  apps: AppInfo[];
  spotifyVersion: string | null;
  spicetifyVersion: string | null;
  extensionsLoaded: boolean;
  themesLoaded: boolean;
  appsLoaded: boolean;
  refreshExtensions: () => Promise<void>;
  refreshThemes: () => Promise<void>;
  refreshApps: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const SpicetifyContext = createContext<SpicetifyContextType | undefined>(undefined);

export const SpicetifyProvider = ({ children }: { children: ReactNode }) => {
  const [extensions, setExtensions] = useState<AddonInfo[]>([]);
  const [themes, setThemes] = useState<ThemeInfo[]>([]);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [spotifyVersion, setSpotifyVersion] = useState<string | null>(null);
  const [spicetifyVersion, setSpicetifyVersion] = useState<string | null>(null);
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);
  const [themesLoaded, setThemesLoaded] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);

  const refreshExtensions = useCallback(async () => {
    try {
      const data = await get("/extensions");
      setExtensions(data);
    } catch (error) {
      console.error("Failed to fetch extensions:", error);
    } finally {
      setExtensionsLoaded(true);
    }
  }, []);

  const refreshThemes = useCallback(async () => {
    try {
      const data = await get("/themes");
      setThemes(data);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    } finally {
      setThemesLoaded(true);
    }
  }, []);

  const refreshApps = useCallback(async () => {
    try {
      const data = await get("/apps");
      setApps(data);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setAppsLoaded(true);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setExtensionsLoaded(false);
    setThemesLoaded(false);
    setAppsLoaded(false);
    await Promise.all([refreshExtensions(), refreshThemes(), refreshApps()]);
  }, [refreshExtensions, refreshThemes, refreshApps]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value = {
    extensions,
    themes,
    apps,
    spotifyVersion,
    spicetifyVersion,
    extensionsLoaded,
    themesLoaded,
    appsLoaded,
    refreshExtensions,
    refreshThemes,
    refreshApps,
    refreshAll,
  };

  return <SpicetifyContext.Provider value={value}>{children}</SpicetifyContext.Provider>;
};

export const useSpicetify = () => {
  const context = useContext(SpicetifyContext);
  if (context === undefined) {
    throw new Error("useSpicetify must be used within a SpicetifyProvider");
  }
  return context;
};
