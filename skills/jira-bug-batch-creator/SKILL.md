---
name: jira-bug-batch-creator
description: >
  Batch-create Jira bug tickets from a plain-English list, with expanded descriptions, STR steps, current/expected behaviour, and Figma references — all as child issues under a specified parent. Use this skill whenever the user provides a list of bugs and wants them raised in Jira, or says things like "create these as tickets", "log these bugs", "raise these under [ISSUE-KEY]", "batch create Jira issues", or "turn this bug list into tickets". Also trigger when the user pastes a list of issues alongside a parent key, Figma link, or STR URL — even if they don't explicitly mention a skill. Optionally annotates an uploaded screenshot with red bounding boxes around visible broken elements before ticket creation.
compatibility: "Requires Atlassian MCP (createJiraIssue, getAccessibleAtlassianResources). bash_tool + Pillow required for optional screenshot annotation."
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.1"
---

# Jira Bug Batch Creator

Creates a set of Jira child issues from a plain-English bug list, expanding each into a structured description format and attaching relevant metadata.

---

## Step 1 — Gather inputs

Before doing anything, confirm the following are present. Extract from the conversation first; only ask for what's missing.

| Input | Required | Notes |
|-------|----------|-------|
| Bug list | Yes | Bullet points or numbered list |
| Parent issue key | Yes | e.g. `XYZ-123` |
| Issue type | Yes | Can be one type for all (e.g. `Bug Sub-Task`) or specified per ticket |
| STR URL | Yes | The URL to reproduce all bugs (or per-bug if they differ) |
| Figma link | Yes | Linked in the Expected behaviour section of each ticket |
| Screenshot | No | If provided, annotate visible broken elements with red boxes (see Step 2) |

If issue type is not specified, default to `Bug Sub-Task` and confirm with the user.

---

## Step 2 — Optional screenshot annotation

If the user has uploaded a screenshot:

1. Use `bash_tool` with Python/Pillow to draw red bounding boxes around the visible broken UI elements mentioned in the bug list.
2. Add a numbered legend at the bottom of the image matching each box to a bug.
3. Note any bugs that are interaction/behaviour-only (scroll, keyboard, focus) and cannot be annotated on a static image — include them in the legend with a note.
4. Save the output to `/mnt/user-data/outputs/annotated_bugs.png` and call `present_files`.

**Note:** The Atlassian MCP does not support file attachments. Inform the user the annotated image cannot be automatically attached to tickets and will need to be attached manually.

---

## Step 3 — Get the Atlassian cloud ID

Call `Atlassian:getAccessibleAtlassianResources` to retrieve the `cloudId`. Use the ID from the result — do not guess or hardcode it.

---

## Step 4 — Expand each bug into a structured description

For every item in the bug list, produce a description using this format:

```
**Issue**
{1–2 sentence explanation of the problem and its impact}

**Steps**
1. Navigate to: {STR URL}
2. {any prerequisite state, e.g. log in as a loyalty member}
3. {action that triggers the bug}
4. {observation step}

**Current behaviour**
{What is actually happening}

**Expected behaviour**
{What should happen instead, with reference to the Figma design: {Figma link}}
```

Guidelines for expanding descriptions:
- Be specific — name the exact element, field, or interaction involved.
- For CMS editability bugs: name the expected CMS mechanism (site string, block property, new field) and suggest a plausible field/key name.
- For accessibility bugs: reference the relevant WCAG criterion and WAI-ARIA pattern (e.g. APG Dialog Pattern for modal issues).
- For display/logic bugs: describe the exact incorrect value or behaviour observed.
- Keep STR steps at 3–5 steps. Don't pad.

---

## Step 5 — Create the issues

For each bug, call `Atlassian:createJiraIssue` with:

```
cloudId:       {from Step 3}
projectKey:    {derived from parent issue key prefix}
issueTypeName: {as specified, or per-ticket if mixed}
parent:        {parent issue key}
summary:       {concise, specific summary — not a copy of the raw bug note}
description:   {expanded description from Step 4}
contentFormat: markdown
```

Write summaries that are specific and self-contained. Avoid vague starters like "Bug:" or "Issue with...". Good examples:
- `Modal subheading 'Stay & Dine' not CMS editable — no field on block`
- `Keyboard focus not trapped within modal — tab order escapes to page behind overlay`

Create tickets sequentially. After all are created, present a summary table.

---

## Step 6 — Summary output

After all tickets are created, output a markdown table:

| # | Key | Summary | Link |
|---|-----|---------|------|
| 1 | ABC-XXXX | ... | https://... |

Note any tickets that failed to create and why.

Remind the user that if they have an annotated screenshot, it will need to be attached to tickets manually via Jira.

---

## Edge cases

- **Mixed issue types**: If the user specifies different types per ticket (e.g. most are `Bug Sub-Task` but one is a `Task`), honour that per ticket.
- **No parent**: If no parent is given, create top-level issues in the project instead — confirm with the user first.
- **No STR URL**: If none is provided, omit the Steps section rather than fabricating a URL.
- **No Figma link**: Omit the Figma reference from Expected behaviour rather than leaving a broken placeholder.
- **Interaction-only bugs**: Bugs involving scroll, keyboard behaviour, focus management, or timing cannot be annotated in a static screenshot — note this in the legend and in the ticket description where relevant.
