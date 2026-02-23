export async function fetchGithubJson(url: string, headers?: Record<string, string>) {
    const response = await fetch(url, { headers: { "User-Agent": "SpicetifyX-Manager", ...headers } });
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchExtensionManifest(repoContentsUrl: string, defaultBranch: string, stargazers_count: number) {
    const contentsUrl = repoContentsUrl.replace("{+path}", "spicetify-marketplace-ext.json");
    try {
        const manifest = await fetchGithubJson(contentsUrl, { Accept: "application/vnd.github.VERSION.raw" });
        return [{ ...manifest, stargazers_count, defaultBranch }];
    } catch (e) {
        return null;
    }
}

export async function fetchAppManifest(repoContentsUrl: string, defaultBranch: string, stargazers_count: number) {
    const contentsUrl = repoContentsUrl.replace("{+path}", "spicetify-marketplace-app.json");
    try {
        const manifest = await fetchGithubJson(contentsUrl, { Accept: "application/vnd.github.VERSION.raw" });
        return [{ ...manifest, stargazers_count, defaultBranch }];
    } catch (e) {
        return null;
    }
}

export async function fetchThemeManifest(repoContentsUrl: string, defaultBranch: string, stargazers_count: number) {
    const contentsUrl = repoContentsUrl.replace("{+path}", "spicetify-marketplace-theme.json");
    try {
        const manifest = await fetchGithubJson(contentsUrl, { Accept: "application/vnd.github.VERSION.raw" });
        return [{ ...manifest, stargazers_count, defaultBranch }];
    } catch (e) {
        return null;
    }
}

export async function fetchCurated() {
    const curatedURL = "https://raw.githubusercontent.com/spicetify/spicetify-extensions/main/curated.json";
    return fetchGithubJson(curatedURL);
}

export async function getTaggedRepos(topic: string, page: number = 1, tags: string[] = [], exactMatch: boolean = false) {
    let url = `https://api.github.com/search/repositories?q=topic:${topic}`;
    if (tags.length > 0) {
        if (exactMatch) {
            url += `+topics:${tags.join("+topics:")}`;
        } else {
            url += `+${tags.map(tag => `topic:${tag}`).join("+")}`;
        }
    }
    url += `&per_page=30&page=${page}`;
    return fetchGithubJson(url);
}
