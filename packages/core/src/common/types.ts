// api specification: https://github.com/SuperMarcus/myanimelist-api-specification/blob/master/README.md

export type Nsfw = 'white' | 'gray' | 'black';

export type AiringStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired'

export type MediaType = "unknown" | "tv" | "ova" | "movie" | "special" | "ona" | "music";

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'

export type Rating = "g" | "pg" | "pg_13" | "r" | "r+" | "rx";

export type RankingType = 'all'
    | 'airing'
    | 'upcoming'
    | 'tv'
    | 'ova'
    | 'movie'
    | 'special'
    | 'bypopularity'
    | 'favorite';

export type SourceType =
    | 'other'
    | 'original'
    | 'manga'
    | '4_koma_manga'
    | 'web_manga'
    | 'digital_manga'
    | 'novel'
    | 'light_novel'
    | 'visual_novel'
    | 'game'
    | 'card_game'
    | 'book'
    | 'picture_book'
    | 'radio'
    | 'music';

export type AnimeRelationType =
    | 'sequel'
    | 'prequel'
    | 'alternative_setting'
    | 'alternative_version'
    | 'side_story'
    | 'parent_story'
    | 'summary'
    | 'full_story';

export interface RelatedAnime {
    node: AnimeNode,
    relation_type: AnimeRelationType;
    relation_type_formatted: string;
}

export type AnimeStudio = {
    id: number,
    name: string;
}

export type Genre = {
    id: number,
    name: string
}

export type MainPicture = {
    medium: string;
    large: string;
};

export type MyListStatus = {
    status: WatchStatus,
    score: number,
    num_episodes_watched: number,
    is_rewatching: boolean,
    start_date?: string;
    finish_date?: string;
    priority: number,
    rewatch_value: number;
    tags: string[];
    updated_at: string
}

export type AnimeBroadcast = {
    day_of_the_week: string;
    start_time?: string;
}

export type AnimeRecommendation = {
    node: AnimeNode,
    num_recommendations: number
}

export type AnimeNode = {
    id: number;
    title: string;
    main_picture: MainPicture;
    media_type: MediaType;
    status: AiringStatus;
    nsfw?: Nsfw;
    genres: Genre[];
    mean: number;
    alternative_titles?: {
        synonyms?: string[];
        en?: string,
        ja?: string
    },
    start_date?: string;
    end_date?: string;
    synopsis?: string;
    rank?: number;
    popularity?: number;
    num_list_users: number;
    num_scoring_users: number;
    num_episodes: number;
    start_season?: {
        year: number,
        season: AnimeSeason
    },
    average_episode_duration?: number,
    studios: AnimeStudio[],
    broadcast?: AnimeBroadcast;
    my_list_status?: MyListStatus
    background?: string;
    source?: SourceType;
    related_anime?: RelatedAnime[];
    related_manga?: RelatedAnime[];
    rating?: Rating;
    pictures?: {
        large?: string
        medium: string
    }[],
    recommendations?: AnimeRecommendation[],
    statistics?: {
        num_list_users: number;
        status: {
            watching: number,
            completed: number,
            on_hold: number,
            dropped: number,
            plan_to_watch: number
        }
    }
};

export type AnimeObject = {
    node: AnimeNode
};

export type AnimeObjectWithRanking = AnimeObject & {
    ranking: {
        rank: number,
        previous_rank?: number
    }
}

export type AnimeObjectWithStatus = AnimeObject & {
    list_status: MyListStatus
}

export type AnimeApiResponse<T extends AnimeObject = AnimeObject> = {
    data: T[];
    paging: {
        next?: string;
        previous?: string;
    };
};

export type AnimeRankingApiResponse = AnimeApiResponse<AnimeObjectWithRanking>;

export type AnimeStatusApiResponse = AnimeApiResponse<AnimeObjectWithStatus>;

// https://myanimelist.net/apiconfig/references/api/v2#operation/anime_season_year_season_get
export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall'
