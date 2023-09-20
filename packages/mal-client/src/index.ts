/* eslint-disable @typescript-eslint/no-namespace */
// import type { AnimeApiResponse, AnimeNode, AnimeRankingApiResponse, AnimeSeason, AnimeStatusApiResponse, RankingType, WatchStatus } from "../core/common/types";
// import type { User } from "./common/user";
import type {
    AnimeApiResponse,
    AnimeNode,
    AnimeRankingApiResponse,
    AnimeSeason,
    AnimeStatusApiResponse,
    RankingType,
    WatchStatus,
    User
} from "@mal/core";

// eslint-disable-next-line @typescript-eslint/ban-types
type Empty = {}

// This was the lazy path, we should write the fields that can be included
export type UserFields = (keyof User) | Empty;

// This was the lazy path, we should write the fields that can be included
export type AnimeFields = (keyof AnimeNode) | Empty;

/**
 * Options to get user information.
 */
export interface GetMyUserInfoOptions {
    /**
     * The fields to include.
     */
    fields?: UserFields[];
}

/**
 * Options to get anime information.
 */
export interface GetAnimeListOptions {
    /**
     * The search term.
     */
    q: string;

    /**
     * Number of anime to include.
     */
    limit?: number,

    /**
     * The number of anime to skip.
     */
    offset?: number;

    /**
     * The fields to include.
     */
    fields?: AnimeFields[];

    /**
     * Whether if include nsfw (not safe for work) anime.
     */
    nsfw?: boolean;
}

/**
 * Options to get anime by rank.
 */
export interface GetAnimeRankingOptions {
    /**
     * The ranking.
     */
    ranking_type: RankingType,

    /**
     * Number of anime to include.
     */
    limit?: number;

    /**
     * The number of anime to skip.
     */
    offset?: number;

    /**
     * The fields to include.
     */
    fields?: AnimeFields[];

    /**
     * Whether if include nsfw (not safe for work) anime.
     */
    nsfw?: boolean;
}

/**
 * Options to get anime by season.
 */
export interface GetSeasonalAnimeOptions {
    /**
     * The year to search.
     */
    year: number,

    /**
     * The season to search.
     */
    season: AnimeSeason,

    /**
     * Sorting logic.
     */
    sort?: 'anime_score' | 'anime_num_list_users',

    /**
     * Number of anime to include.
     */
    limit?: number;

    /**
     * The number of anime to skip.
     */
    offset?: number;

    /**
     * The fields to include.
     */
    fields?: AnimeFields[];

    /**
     * Whether if include nsfw (not safe for work) anime.
     */
    nsfw?: boolean;
}

/**
 * Options to get user suggested anime.
 */
export interface GetSuggestedAnimeOptions {
    /**
     * Number of anime to include.
     */
    limit?: number;

    /**
     * The number of anime to skip.
     */
    offset?: number;

    /**
     * The fields to include.
     */
    fields?: AnimeFields[];

    /**
     * Whether if include nsfw (not safe for work) anime.
     */
    nsfw?: boolean;
}

/**
 * Input to update user anime list.
 */
export interface UpdateMyAnimeListStatusOptions {
    /**
     * The status of the anime.
     */
    status?: WatchStatus;

    /**
     * Whether if the user is rewatching the anime.
     */
    is_rewatching?: boolean;

    /**
     * The user anime score.
     */
    score?: number;

    /**
     * Number of episodes the user watched.
     */
    num_watched_episodes: number;

    /**
     * Priority of this anime.
     */
    priority?: number;

    /**
     * Number of times the user rewatched this anime.
     */
    num_times_rewatched?: number;

    /**
     * The rewatch value.
     */
    rewatch_value?: number;

    /**
     * User tags.
     */
    tags?: string[];

    /**
     * Comments for this anime.
     */
    comments?: string;
}

/**
 * Options to get the user anime list.
 */
export interface GetUserAnimeListOptions {
    /**
     * The status of the anime to get.
     */
    status?: WatchStatus,

    /**
     * How to sort the anime list.
     */
    sort?: 'list_score' | 'list_updated_at' | 'anime_title' | 'anime_start_date' | 'anime_id',

    /**
     * Number of anime to include.
     */
    limit?: number;

    /**
     * The number of anime to skip.
     */
    offset?: number;

    /**
     * The fields to include.
     */
    fields?: AnimeFields[];

    /**
     * Whether if include nsfw (not safe for work) anime.
     */
    nsfw?: boolean;
}

/**
 * Configuration of the client.
 * 
 * You will need an `access token` or `client id` to use this client.
 * @see https://myanimelist.net/apiconfig/references/authorization
 */
export interface MALClientConfig {
    /**
     * Fetch implementation to use.
     * 
     * @default 
     * Defaults to global.
     */
    fetch?: typeof fetch,

    /**
     * The access token.
     */
    accessToken?: string;

    /**
     * The client id.
     */
    clientId?: string;

    /**
     * The url to send all the requests to.
     * 
     * @default 
     * `https://api.myanimelist.net/v2`
     */
    proxyUrl?: string;
}

/**
 * A `MyAnimeList` request.
 */
export interface MALRequestInit {
    /**
     * The endpoint.
     */
    resource: `/${string}`;

    /**
     * The http method.
     */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    /**
     * The url query params.
     */
    params?: Record<string, unknown>,

    /**
     * Whether if return null instead of throwing an error when `404` is returned.
     */
    returnNullOn404?: boolean;

    /**
     * Additional headers to send.
     */
    headers?: Record<string, string>;

    /**
     * The request body.
     */
    body?: BodyInit | null | undefined;
}

type UserName = "@me" | (string & Empty)

/**
 * An error that ocurred during a request.
 */
export class MalHttpError extends Error {
    /**
     * An error that ocurred during a `MyAnimeList` request.
     * @param status The status code of the error.
     * @param message The message of the error.
     * @param cause The cause of the error.
     */
    constructor(public readonly status: number, message: string, cause?: unknown) {
        super(message, { cause })
    }
}

/**
 * A client to send requests to `MyAnimeList` api.
 */
export class MALClient {
    #config: MALClientConfig;

    constructor(config: MALClientConfig = {}) {
        if (config.accessToken == null && config.clientId == null) {
            throw new Error("access token or client id are required");
        }

        // shallow copy to prevent modifying the original
        this.#config = { ...config };
    }

    /**
     * Sends a request to `MyAnimeList` api.
     * @param init Request initialization.
     */
    public request<T extends object>(init: MALRequestInit & { returnNullOn404: true }): Promise<T | null>
    public request<T extends object>(init: MALRequestInit & { returnNullOn404?: undefined }): Promise<T>
    public async request<T extends object>(init: MALRequestInit): Promise<T | null> {
        const {
            resource,
            method,
            body,
            params,
            returnNullOn404 = false,
            headers = {},
        } = init;

        const {
            accessToken,
            clientId,
            fetch: fetchFunction = typeof window !== 'undefined' ? window.fetch : globalThis.fetch,
            proxyUrl,
        } = this.#config;

        const apiUrl = proxyUrl ?? "https://api.myanimelist.net/v2";
        let url = `${apiUrl}${resource}`;

        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value === undefined) {
                    continue;
                }

                searchParams.set(key, String(value));
            }

            url += "?" + searchParams.toString()
        }

        if (accessToken == null && clientId == null) {
            throw new Error("access token or client id are required");
        }

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        // We ignore the client id if we had the access token
        if (clientId && accessToken == null) {
            headers["X-MAL-CLIENT-ID"] = clientId;
        }

        const res = await fetchFunction(url, {
            method,
            headers,
            body,
        });

        if (returnNullOn404 === true && res.status === 404) {
            return null;
        }

        if (!res.ok) {
            const msg = await res.text();
            console.error(`❌ ${msg}`);
            throw new MalHttpError(res.status, msg);
        }

        const data = await res.json() as T;
        return data;
    }

    /**
     * Search anime by a term.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_get.
     * @param options The options.
     * @returns 
     */
    async getAnimeList(options: GetAnimeListOptions): Promise<AnimeApiResponse> {
        const { fields = [], limit, offset, q, ...rest } = options;

        const result = await this.request<AnimeApiResponse>({
            method: 'GET',
            resource: '/anime',
            params: {
                q,
                limit,
                offset,
                fields: fields.length === 0 ? undefined : fields.join(","),
                ...rest
            }
        });

        return result;
    }

    /**
     * Gets the details of an anime.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_anime_id_get
     * @param animeId The id of the anime.
     * @param options The options.
     */
    async getAnimeDetails(animeId: number, options: { fields?: AnimeFields[] }) {
        const { fields = [] } = options;

        const result = await this.request<AnimeNode>({
            method: 'GET',
            resource: `/anime/${animeId}`,
            returnNullOn404: true,
            params: {
                fields: fields.length === 0 ? undefined : fields.join(",")
            }
        });

        return result;
    }

    /**
     * Get a list of anime of the given rank.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_ranking_get
     * @param options The options.
     */
    async getAnimeRanking(options: GetAnimeRankingOptions) {
        const { fields = [], ...params } = options;

        const result = await this.request<AnimeRankingApiResponse>({
            method: 'GET',
            resource: `/anime/ranking`,
            params: {
                fields: fields.length === 0 ? undefined : fields.join(","),
                ...params
            }
        });

        return result;
    }

    /**
     * Gets a list of the anime of the given season.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_season_year_season_get
     * @param options The options.
     */
    async getSeasonalAnime(options: GetSeasonalAnimeOptions) {
        const { fields = [], year, season, ...params } = options;

        const result = await this.request<AnimeApiResponse>({
            method: 'GET',
            resource: `/anime/season/${year}/${season}`,
            params: {
                fields: fields.length === 0 ? undefined : fields.join(","),
                ...params
            }
        });

        return result;
    }

    /**
     * Gets an anime suggestion for the user identified by the `accessToken`.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_suggestions_get
     * @param options The options.
     */
    async getSuggestedAnime(options: GetSuggestedAnimeOptions) {
        const { fields = [], ...params } = options;

        const result = await this.request<AnimeApiResponse>({
            method: 'GET',
            resource: `/anime/suggestions`,
            params: {
                fields: fields.length === 0 ? undefined : fields.join(","),
                ...params
            }
        });

        return result;
    }

    /**
     * Updates the given user anime status.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_anime_id_my_list_status_put
     * @param animeId The anime id.
     * @param options The input options.
     */
    async updateMyAnimeListStatus(animeId: number, options: UpdateMyAnimeListStatusOptions) {
        const { ...rest } = options;

        const body = new URLSearchParams();

        for (const [key, value] of Object.entries(rest)) {
            if (value === undefined) {
                continue;
            }

            body.set(key, String(value));
        }

        const result = await this.request<AnimeNode>({
            method: 'PATCH',
            resource: `/anime/${animeId}/my_list_status`,
            returnNullOn404: true,
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return result;
    }

    /**
     * Delete the given anime from the user list.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/anime_anime_id_my_list_status_delete
     * @param animeId The anime id.
     */
    async deleteMyAnimeListStatus(animeId: number) {
        const result = await this.request<Empty>({
            method: 'DELETE',
            resource: `/anime/${animeId}/my_list_status`,
            returnNullOn404: true,
        });

        return result;
    }

    /**
     * Gets the given user anime list.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/users_user_id_animelist_get
     * @param userName The username.
     * @param options The options.
     */
    async getUserAnimeList(userName: UserName, options: GetUserAnimeListOptions) {
        const { fields = [], ...params } = options;

        const result = await this.request<AnimeStatusApiResponse>({
            method: 'GET',
            resource: `/users/${userName}/animelist`,
            params: {
                fields: fields.length === 0 ? undefined : fields.join(","),
                ...params
            }
        });

        return result;
    }

    /**
     * Gets information about the given user.
     * @see https://myanimelist.net/apiconfig/references/api/v2#operation/users_user_id_get
     * @param options The options.
     */
    async getMyUserInfo(options: GetMyUserInfoOptions, userId = "@me"): Promise<User> {
        const { fields = [] } = options;

        const result = await this.request<User>({
            method: 'GET',
            resource: `/users/${userId}`,
            params: {
                fields: fields.length > 0 ? fields.join(",") : undefined
            },
        });

        return result;
    }
}