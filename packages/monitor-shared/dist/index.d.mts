declare function createEventId(): string;

interface NormalizedError {
    name?: string;
    message: string;
    stack?: string;
}
declare function normalizeError(error: unknown): NormalizedError;

declare function getLocationInfo(): {
    url: string;
    pathname: string;
    title: string;
    userAgent: string;
};

export { createEventId, getLocationInfo, normalizeError };
