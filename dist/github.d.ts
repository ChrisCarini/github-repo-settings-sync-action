export declare const client: import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
};
export declare function getRepos(): Promise<string[]>;
/**
 * Get user inputs as an array (expects the user input to be CSV)
 * @param name The name of the user input
 * @param defaultVal The default value
 */
export declare function getInputArray(name: string, defaultVal: string[]): string[];
/**
 * Get user inputs
 * @param name The name of the user input
 * @param defaultValue The default value
 */
export declare function getInputWithDefault(name: string, defaultValue: string): string;
/**
 * Helper to pretty-print JSON as log debug.
 * @param value The object to pretty-print
 * @param name The name (used for header/footer)
 */
export declare function coreDebugJson(value: object, name: string): void;
