import * as core from '@actions/core';
import * as github from '@actions/github';
// eslint-disable-next-line node/no-missing-import
import { client, coreDebugJson, getInputArray, getInputWithDefault, getRepos } from './github';

type UserInputs = {
  repositories: string[];
  allowIssues: boolean;
  allowProjects: boolean;
  allowWiki: boolean;
  squashMerge: boolean;
  mergeCommit: boolean;
  rebaseMerge: boolean;
  autoMerge: boolean;
  deleteHead: boolean;
  branchProtectionEnabled: string;
  branchProtectionName: string;
  requiredStatusChecks: any;
  requiredConvoResolution: boolean;
  requiredSignatures: boolean;
  requiredLinearHistory: boolean;
  lockBranch: boolean;
  enforceAdmins: boolean;
  allowForcePushes: boolean;
  allowDeletions: boolean;
  blockCreations: boolean;
  allowForkSyncing: boolean;
};

/**
 * Gather all the inputs from the user workflow file.
 */
async function gatherInputs(): Promise<UserInputs> {
  core.startGroup('Gathering inputs...');
  // coreDebugJson(github.context, 'github.context');

  const repositories = getInputArray('REPOSITORIES', ['ALL']);
  const allowIssues = getInputWithDefault('ALLOW_ISSUES', 'true') === 'true';
  const allowProjects = getInputWithDefault('ALLOW_PROJECTS', 'true') === 'true';
  const allowWiki = getInputWithDefault('ALLOW_WIKI', 'true') === 'true';
  const squashMerge = getInputWithDefault('SQUASH_MERGE', 'true') === 'true';
  const mergeCommit = getInputWithDefault('MERGE_COMMIT', 'true') === 'true';
  const rebaseMerge = getInputWithDefault('REBASE_MERGE', 'true') === 'true';
  const autoMerge = getInputWithDefault('AUTO_MERGE', 'false') === 'true';
  const deleteHead = getInputWithDefault('DELETE_HEAD', 'false') === 'true';

  // Branch Protection Settings
  const branchProtectionEnabled = getInputWithDefault('BRANCH_PROTECTION_ENABLED', 'UNCHANGED');
  const branchProtectionName = getInputWithDefault('BRANCH_PROTECTION_NAME', 'main');
  const requiredStatusChecks = JSON.parse(getInputWithDefault('BP_REQUIRED_STATUS_CHECKS', 'null'));
  const requiredConvoResolution = getInputWithDefault('BP_REQUIRED_CONVO_RESOLUTION', 'false') === 'true';
  const requiredSignatures = getInputWithDefault('BP_REQUIRED_SIGNATURES', 'false') === 'true';
  const requiredLinearHistory = getInputWithDefault('BP_REQUIRED_LINEAR_HISTORY', 'false') === 'true';
  const lockBranch = getInputWithDefault('BP_LOCK_BRANCH', 'false') === 'true';
  const enforceAdmins = getInputWithDefault('BP_ENFORCE_ADMINS', 'false') === 'true';
  const allowForcePushes = getInputWithDefault('BP_ALLOW_FORCE_PUSHES', 'false') === 'true';
  const allowDeletions = getInputWithDefault('BP_ALLOW_DELETIONS', 'false') === 'true';
  const blockCreations = getInputWithDefault('BP_BLOCK_CREATIONS', 'false') === 'true';
  const allowForkSyncing = getInputWithDefault('BP_ALLOW_FORK_SYNCING', 'false') === 'true';

  core.info('Inputs:');
  core.info('=======');
  core.info(`REPOSITORIES:                 ${repositories}`);
  core.info(`ALLOW_ISSUES:                 ${allowIssues}`);
  core.info(`ALLOW_PROJECTS:               ${allowProjects}`);
  core.info(`ALLOW_WIKI:                   ${allowWiki}`);
  core.info(`SQUASH_MERGE:                 ${squashMerge}`);
  core.info(`MERGE_COMMIT:                 ${mergeCommit}`);
  core.info(`REBASE_MERGE:                 ${rebaseMerge}`);
  core.info(`AUTO_MERGE:                   ${autoMerge}`);
  core.info(`DELETE_HEAD:                  ${deleteHead}`);
  core.info(`BRANCH_PROTECTION_ENABLED:    ${branchProtectionEnabled}`);
  core.info(`BRANCH_PROTECTION_NAME:       ${branchProtectionName}`);
  core.info(`BP_REQUIRED_STATUS_CHECKS:    ${JSON.stringify(requiredStatusChecks)}`);
  core.info(`BP_REQUIRED_CONVO_RESOLUTION: ${requiredConvoResolution}`);
  core.info(`BP_REQUIRED_SIGNATURES:       ${requiredSignatures}`);
  core.info(`BP_REQUIRED_LINEAR_HISTORY:   ${requiredLinearHistory}`);
  core.info(`BP_LOCK_BRANCH:               ${lockBranch}`);
  core.info(`BP_ENFORCE_ADMINS:            ${enforceAdmins}`);
  core.info(`BP_ALLOW_FORCE_PUSHES:        ${allowForcePushes}`);
  core.info(`BP_ALLOW_DELETIONS:           ${allowDeletions}`);
  core.info(`BP_BLOCK_CREATIONS:           ${blockCreations}`);
  core.info(`BP_ALLOW_FORK_SYNCING:        ${allowForkSyncing}`);
  core.info('');
  core.endGroup(); // Gathering inputs...
  return {
    repositories,
    allowIssues,
    allowProjects,
    allowWiki,
    squashMerge,
    mergeCommit,
    rebaseMerge,
    autoMerge,
    deleteHead,
    branchProtectionEnabled,
    branchProtectionName,
    requiredStatusChecks,
    requiredConvoResolution,
    requiredSignatures,
    requiredLinearHistory,
    lockBranch,
    enforceAdmins,
    allowForcePushes,
    allowDeletions,
    blockCreations,
    allowForkSyncing,
  };
}

async function run(): Promise<void> {
  try {
    const config = await gatherInputs();

    let repos = config.repositories;

    if (repos.length === 1 && repos[0] === 'ALL') {
      repos = await getRepos();
    }

    for (const ownerRepo of repos) {
      core.startGroup(`Repo: ${ownerRepo}`);

      const [owner, repo] = ownerRepo.split('/', 2);
      core.debug(`Owner: ${owner}`);
      core.debug(`Repository: ${repo}`);

      core.info('Updating repository settings');

      const repoUpdateData = {
        owner,
        repo,
        ...(config.allowIssues ? { has_issues: config.allowIssues } : {}),
        ...(config.allowProjects ? { has_projects: config.allowProjects } : {}),
        ...(config.allowWiki ? { has_wiki: config.allowWiki } : {}),
        ...(config.squashMerge ? { allow_squash_merge: config.squashMerge } : {}),
        ...(config.mergeCommit ? { allow_merge_commit: config.mergeCommit } : {}),
        ...(config.rebaseMerge ? { allow_rebase_merge: config.rebaseMerge } : {}),
        ...(config.autoMerge ? { allow_auto_merge: config.autoMerge } : {}),
        ...(config.deleteHead ? { delete_branch_on_merge: config.deleteHead } : {}),
        // // TODO(ChrisCarini) - Future enhancements.
        // ...(config.allow_update_branch ? {allow_update_branch: config.allow_update_branch} : {}),
        // ...(config.squash_merge_commit_title ? {squash_merge_commit_title: config.squash_merge_commit_title} : {}),
        // ...(config.squash_merge_commit_message ? {squash_merge_commit_message: config.squash_merge_commit_message} : {}),
        // ...(config.merge_commit_title ? {merge_commit_title: config.merge_commit_title} : {}),
        // ...(config.merge_commit_message ? {merge_commit_message: config.merge_commit_message} : {}),
        // ...(config.allow_forking ? {allow_forking: config.allow_forking} : {}),
        // ...(config.web_commit_signoff_required ? {web_commit_signoff_required: config.web_commit_signoff_required} : {}),
      };

      core.debug(`Options: ${JSON.stringify(repoUpdateData)}`);
      await client.rest.repos.update(repoUpdateData);

      if (config.branchProtectionEnabled === 'enabled') {
        core.info(`Setting branch protection rules for branch [${config.branchProtectionName}]`);

        const repoBranchProtectionData = {
          owner,
          repo,
          branch: config.branchProtectionName,

          required_pull_request_reviews: null, // TODO(ChrisCarini) - Future enhancement; figure out how to structure these in configs.
          required_status_checks: config.requiredStatusChecks,
          required_conversation_resolution: config.requiredConvoResolution,
          required_signatures: config.requiredSignatures,
          required_linear_history: config.requiredLinearHistory,
          lock_branch: config.lockBranch,
          enforce_admins: config.enforceAdmins,
          allow_force_pushes: config.allowForcePushes,
          allow_deletions: config.allowDeletions,
          restrictions: null, // TODO(ChrisCarini) - Future enhancement; figure out how to structure these in configs.
          block_creations: config.blockCreations,
          allow_fork_syncing: config.allowForkSyncing,
        };
        core.debug(`Options: ${JSON.stringify(repoBranchProtectionData)}`);
        await client.rest.repos.updateBranchProtection(repoBranchProtectionData);
      } else if (config.branchProtectionEnabled === 'disabled') {
        core.info(`Removing branch protection rules for branch [${config.branchProtectionName}]`);
        await client.rest.repos.deleteBranchProtection({
          owner,
          repo,
          branch: config.branchProtectionName,
        });
      } else {
        core.info(`Leaving branch protection rules for branch [${config.branchProtectionName}] untouched`);
      }

      core.info(`Completed Repository: ${ownerRepo}`);
      core.endGroup();
    }
  } catch (error) {
    core.setFailed(`${(error as any)?.message ?? error}`);
    core.endGroup(); // End any lingering groups...
  }
}

// eslint-disable-next-line github/no-then
void run().then(() => {
  core.info('Completed.');
});
