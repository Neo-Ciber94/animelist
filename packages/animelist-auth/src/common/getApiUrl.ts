/**
 * Returns the path of the `MyAnimeList` api.
 *
 * It returns `PUBLIC_MAL_API_URL` environment variable if available.
 */
export function getApiUrl() {
  if (process.env.PUBLIC_MAL_API_URL) {
    return process.env.PUBLIC_MAL_API_URL;
  }

  return "/api/myanimelist";
}
