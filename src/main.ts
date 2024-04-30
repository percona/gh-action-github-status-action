import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import makeStatusRequest, { StatusRequest } from './makeStatusRequest';
import { getErrorMessage } from './utils';

async function run(): Promise<void> {
  const authToken: string = core.getInput('authToken');
  let octokit: Octokit | null = null;

  try {
    octokit = new Octokit({
      auth: authToken,
      userAgent: 'github-status-action',
      baseUrl: 'https://api.github.com',
      log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error,
      },
      request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0,
      },
    });
  } catch (error) {
    core.setFailed('Error creating octokit:\n' + getErrorMessage(error));
    return;
  }

  if (octokit == null) {
    core.setFailed('Error creating octokit:\noctokit was null');
    return;
  }

  let statusRequest: StatusRequest;
  try {
    statusRequest = makeStatusRequest();
  } catch (error) {
    core.setFailed(
      `Error creating status request object: ${getErrorMessage(error)}`
    );
    return;
  }

  try {
    await octokit.repos.createCommitStatus(statusRequest);
  } catch (error) {
    core.setFailed(
      `Error setting status:\n${getErrorMessage(
        error
      )}\nRequest object:\n${JSON.stringify(statusRequest, null, 2)}`
    );
  }
}

run();
