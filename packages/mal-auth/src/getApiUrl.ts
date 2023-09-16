

/**
 * Returns the path of the `MyAnimeList` api.
 * 
 * It returns `PUBLIC_MY_ANIME_LIST_API` if available.
 */
export function getApiUrl() {
    if (process.env.PUBLIC_MY_ANIME_LIST_API) {
        return process.env.PUBLIC_MY_ANIME_LIST_API;
    }

    return "/api/myanimelist";
}