
/**
 * Options to create an `HttpError`.
 */
export type HttpErrorOptions = {
    /**
     * The status code of the error.
     */
    status: number,

    /**
     * Additional headers to be sent with the error.
     */
    headers?: Record<string, string>,

    /**
     * Message to be sent with the error.
     */
    message?: string;

    /**
     * Cause of the error.
     */
    cause?: unknown,
}

/**
 * Represents an http error.
 */
export class HttpError extends Error {
    public readonly status: number = 500;
    public readonly headers: Record<string, string> = {};

    constructor({ status, headers, message, cause }: HttpErrorOptions) {
        super(message, { cause });
        this.status = status;
        this.headers = headers || {};
    }

    /**
     * Converts this error into a http response.
     */
    toResponse(): Response {
        const message = this.message;
        const body = message ? JSON.stringify({ message }) : null;
        const headers = this.headers || {};

        if (body) {
            headers['Content-Type'] = 'application/json'
        }

        return new Response(body, {
            status: this.status,
            headers
        })
    }
}

type RedirectionStatus = 301 | 302 | 303 | 304 | 305 | 306 | 307;

/**
 * Returns a redirection `HttpError`.
 * @internal 
 */
export function redirect(status: RedirectionStatus, url: string) {
    return new HttpError({ status, headers: { 'Location': url } })
}

/** 
 * Returns an `HttpError` for the given status code.
 * @internal 
 * */
export function error(status: number, message = "Something went wrong") {
    if (status < 400) {
        throw new Error(`'${status}' is not a valid http error status`)
    };

    return new HttpError({ status, message })
}