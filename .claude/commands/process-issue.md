---
description: Process a GitHub issue and create a PR with implementation
args:
  issue_number:
    description: GitHub issue number to process
    required: true
---

# Process GitHub Issue and Create PR

You are implementing changes for GitHub issue #{{issue_number}}.

## Workflow

Follow these steps to process the issue and create a pull request:

### 1. Fetch and Analyze the Issue

First, fetch the GitHub issue details using the `gh` CLI:
- Use `gh issue view {{issue_number}}` to read the issue title, body, and comments
- **Check for sub-issues**: Look for linked issues, task lists with issue references (e.g., "- [ ] #123"), or mentions of related issues in the body/comments
- If sub-issues exist:
  - Identify all sub-issue numbers
  - Fetch each sub-issue using `gh issue view <sub-issue-number>`
  - Analyze the parent issue and all sub-issues together to understand the full scope
  - Plan to implement all sub-issues in the same PR (if they're closely related) or determine if they should be separate PRs
- Analyze the requirements and acceptance criteria for the main issue and all sub-issues
- Identify affected files and components based on the project structure in CLAUDE.md

### 2. Plan the Implementation

Create a detailed implementation plan using the TodoWrite tool:
- Break down the main issue AND all sub-issues into concrete, actionable tasks
- Organize tasks logically (e.g., group related sub-issues together)
- Mark each task with its corresponding issue number for tracking (e.g., "Implement feature X (#42)")
- Follow the architecture principles from CLAUDE.md:
  - **Core Module** (`src/app/core/`): Singleton services and layout components
  - **Feature Modules** (`src/app/features/`): Self-contained features, no cross-feature imports
  - **Shared Module** (`src/app/shared/`): Reusable code (models, services, utilities)
- Ensure compliance with:
  - Angular 19 standalone components
  - TypeScript 5.7 strict typing
  - Finnish-first UI text
  - Responsive design (desktop + mobile ≤768px)
  - No circular dependencies

### 3. Create Feature Branch

Create a new branch for this issue:
- Branch name format: `issue-{{issue_number}}-<short-description>`
- Use `git checkout -b <branch-name>`

### 4. Implement Changes

Execute the implementation plan for the main issue and all sub-issues:
- Implement changes in a logical order (handle dependencies first)
- For each sub-issue, ensure its requirements are fully met
- Follow the project structure and conventions from CLAUDE.md
- Maintain feature isolation (features cannot import from other features)
- Use proper import paths: features import from `core/` and `shared/` only
- Write TypeScript with strict type checking
- Keep UI text in Finnish (comments can be in English)
- Update TodoWrite status as you progress (mark in_progress → completed)
- Track which sub-issue each task corresponds to for clear progress visibility

### 5. Build and Verify

Before committing:
- Run `npm run build` to ensure no errors
- Check for TypeScript errors
- Verify responsive design works (if UI changes)
- Test the implementation manually if needed

### 6. Commit Changes

Create a commit following the git protocol:
- Run `git status` and `git diff` to review changes
- Add relevant files with `git add`
- Create commit with meaningful message following repository style
- Include the standard footer:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### 7. Push and Create PR

Push the branch and create a pull request:
- Use `git push -u origin <branch-name>`
- Create PR with `gh pr create` using this format:
  ```bash
  gh pr create --title "<PR title>" --body "$(cat <<'EOF'
  ## Summary
  Resolves #{{issue_number}}

  [If sub-issues exist, list them:]
  - Resolves #<sub-issue-1>
  - Resolves #<sub-issue-2>
  - etc.

  <Brief summary of changes in 1-3 bullet points>

  ## Changes Made
  <Detailed list of changes, organized by sub-issue if applicable>

  ### Main Issue (#{{issue_number}})
  - <change 1>
  - <change 2>

  [If sub-issues exist:]
  ### Sub-issue #<number>: <title>
  - <change 1>
  - <change 2>

  ## Test Plan
  - [ ] Build succeeds (`npm run build`)
  - [ ] TypeScript type checking passes
  - [ ] UI text is in Finnish (if applicable)
  - [ ] Responsive design tested (desktop + mobile) (if applicable)
  - [ ] No circular dependencies introduced
  - [ ] Architecture principles followed (Core/Features/Shared)
  - [ ] All sub-issues requirements met (if applicable)

  ## Additional Notes
  <Any additional context, screenshots, or comments>

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

### 8. Add PR Comments (Optional)

If there are important notes, warnings, or areas that need review:
- Add inline comments on specific code changes if needed
- You can use `gh pr comment <pr-number> --body "<comment>"` for general comments
- Mention any trade-offs or design decisions made

## Important Notes

- **DO NOT push to master/main**: Always create a feature branch and PR
- **Follow CLAUDE.md**: Respect all architecture principles and conventions
- **Use TodoWrite**: Track all tasks from start to finish
- **Finnish UI**: All user-facing text must be in Finnish
- **Type Safety**: Ensure strict TypeScript compliance
- **No Cross-Feature Imports**: Features must remain isolated
- **Test Before PR**: Build must succeed before creating PR
- **Sub-issues**: Always check for and process sub-issues together with the main issue
- **One PR for Related Issues**: If sub-issues are closely related, implement them all in one PR; otherwise discuss with the user

## Example Usage

```
/process-issue 42
```

This will:
1. Fetch issue #42 from GitHub (and any sub-issues)
2. Analyze the main issue and all sub-issues
3. Create comprehensive implementation plan covering all issues
4. Create branch `issue-42-<description>`
5. Implement changes for main issue and all sub-issues
6. Run build to verify
7. Commit with proper message referencing all issues
8. Push and create PR with detailed description listing all resolved issues
9. Return PR URL for review

## Sub-Issue Detection

The command will automatically detect sub-issues through:
- **Task lists with issue references**: `- [ ] Implement feature (#123)`
- **"Depends on" or "Blocked by"**: Links to prerequisite issues
- **GitHub issue links**: Direct references in the issue body or comments
- **Related issues**: Issues mentioned in context of the parent issue

If sub-issues are found, they will all be processed together in a single PR that resolves both the parent issue and all sub-issues.
