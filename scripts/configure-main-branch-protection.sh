#!/usr/bin/env bash

set -euo pipefail

owner="${1:-co-r-e}"
repo="${2:-sliderenewal}"
branch="${3:-main}"
bypass_user="${4:-mokuwaki}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required." >&2
  exit 1
fi

prefer_keyring=0
if [[ -n "${GH_TOKEN:-}" ]] && env -u GH_TOKEN gh auth status >/dev/null 2>&1; then
  prefer_keyring=1
fi

run_gh() {
  if [[ "${prefer_keyring}" -eq 1 ]]; then
    env -u GH_TOKEN gh "$@"
  else
    gh "$@"
  fi
}

if ! run_gh auth status >/dev/null 2>&1; then
  echo "Authenticate gh CLI before running this script." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required." >&2
  exit 1
fi

echo "Applying branch protection to ${owner}/${repo}:${branch}"
echo "Bypass user: ${bypass_user}"
if [[ "${prefer_keyring}" -eq 1 ]]; then
  echo "Using stored gh credentials because GH_TOKEN takes precedence in this shell."
fi

metadata_query='
query($owner: String!, $repo: String!, $login: String!) {
  repository(owner: $owner, name: $repo) {
    id
    branchProtectionRules(first: 100) {
      nodes {
        id
        pattern
      }
    }
  }
  user(login: $login) {
    id
    login
  }
}
'

metadata_json="$(run_gh api graphql \
  -F owner="${owner}" \
  -F repo="${repo}" \
  -F login="${bypass_user}" \
  -f query="${metadata_query}")"

repository_id="$(printf '%s' "${metadata_json}" | jq -r '.data.repository.id')"
user_id="$(printf '%s' "${metadata_json}" | jq -r '.data.user.id')"
rule_id="$(printf '%s' "${metadata_json}" | jq -r --arg branch "${branch}" '.data.repository.branchProtectionRules.nodes[]? | select(.pattern == $branch) | .id' | head -n 1)"

if [[ -z "${repository_id}" || "${repository_id}" == "null" ]]; then
  echo "Repository ${owner}/${repo} was not found or is not accessible." >&2
  exit 1
fi

if [[ -z "${user_id}" || "${user_id}" == "null" ]]; then
  echo "GitHub user ${bypass_user} was not found." >&2
  exit 1
fi

create_mutation='
mutation($repositoryId: ID!, $pattern: String!, $bypassUserId: ID!) {
  createBranchProtectionRule(input: {
    repositoryId: $repositoryId
    pattern: $pattern
    requiresApprovingReviews: true
    requiredApprovingReviewCount: 1
    requiresCodeOwnerReviews: false
    dismissesStaleReviews: false
    requireLastPushApproval: false
    isAdminEnforced: true
    bypassPullRequestActorIds: [$bypassUserId]
  }) {
    branchProtectionRule {
      id
      pattern
    }
  }
}
'

update_mutation='
mutation($ruleId: ID!, $bypassUserId: ID!) {
  updateBranchProtectionRule(input: {
    branchProtectionRuleId: $ruleId
    requiresApprovingReviews: true
    requiredApprovingReviewCount: 1
    requiresCodeOwnerReviews: false
    dismissesStaleReviews: false
    requireLastPushApproval: false
    isAdminEnforced: true
    bypassPullRequestActorIds: [$bypassUserId]
  }) {
    branchProtectionRule {
      id
      pattern
    }
  }
}
'

if [[ -n "${rule_id}" ]]; then
  run_gh api graphql \
    -F ruleId="${rule_id}" \
    -F bypassUserId="${user_id}" \
    -f query="${update_mutation}" >/dev/null
else
  run_gh api graphql \
    -F repositoryId="${repository_id}" \
    -F pattern="${branch}" \
    -F bypassUserId="${user_id}" \
    -f query="${create_mutation}" >/dev/null
fi

run_gh api \
  --method POST \
  "repos/${owner}/${repo}/branches/${branch}/protection/enforce_admins" >/dev/null

verify_query='
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    branchProtectionRules(first: 100) {
      nodes {
        pattern
        requiresApprovingReviews
        requiredApprovingReviewCount
        isAdminEnforced
        bypassPullRequestAllowances(first: 20) {
          nodes {
            actor {
              __typename
              ... on User {
                login
              }
            }
          }
        }
      }
    }
  }
}
'

verify_json="$(run_gh api graphql \
  -F owner="${owner}" \
  -F repo="${repo}" \
  -f query="${verify_query}")"

printf '%s\n' "${verify_json}" | jq -c --arg branch "${branch}" '.data.repository.branchProtectionRules.nodes[] | select(.pattern == $branch)'
