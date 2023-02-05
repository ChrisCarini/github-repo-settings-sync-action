import * as github from '@actions/github';
import * as core from '@actions/core';

const token = core.getInput('token', { required: true });
export const client = github.getOctokit(token);

export async function getRepos(): Promise<string[]> {
  const pullRequest = github.context.payload.workflow_run.pull_requests[0];
  if (pullRequest !== undefined) {
    core.debug(`github.context.payload.workflow_run.pull_requests[0] !== undefined : Using PR #${pullRequest}.`);
    return pullRequest;
  }
  const { owner } = github.context.repo;

  const { data: repos } = await client.rest.repos.listForUser({ username: owner });
  coreDebugJson(repos, 'getRepos() > repos');
  return repos.map((repo) => `${repo.owner}/${repo.name}`);
}

/**
 * Get user inputs as an array (expects the user input to be CSV)
 * @param name The name of the user input
 * @param defaultVal The default value
 */
export function getInputArray(name: string, defaultVal: string[]): string[] {
  return (
    core
      .getInput(name)
      .split('\n')
      .map((i) => i.trim()) || defaultVal
  );
}

/**
 * Get user inputs
 * @param name The name of the user input
 * @param defaultValue The default value
 */
export function getInputWithDefault(name: string, defaultValue: string): string {
  return core.getInput(name) || defaultValue;
}

// TODO - Checking w/ Steve; this might be better to replace the above 2 methods.
// export function smarterGetInputWithDefault<Type extends string | string[]>(name: string, defaultValue: Type): Type {
//   const input = core.getInput(name);
//   if (Array.isArray(defaultValue)) {
//     return (input.split(',').map((i) => i.trim()) || defaultValue) as Type;
//   }
//   return (input || defaultValue) as Type;
// }

/**
 * Helper to pretty-print JSON as log debug.
 * @param value The object to pretty-print
 * @param name The name (used for header/footer)
 */
export function coreDebugJson(value: object, name: string): void {
  core.debug(`====== BEGIN ${name} ======`);
  core.debug(JSON.stringify(value, null, 4));
  core.debug(`======= END ${name} =======`);
}
