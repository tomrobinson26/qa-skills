---
name: ado-bug-batch-creator
description: >
  Batch-create Azure DevOps work items (Bugs or Tasks) from a plain-English list, expanding each into a structured body with STR steps, current/expected behaviour, and design references — all as child work items under a specified parent. Use this skill whenever the user provides a list of bugs or tasks and wants them raised in Azure DevOps (ADO), or says things like "create these as ADO items", "log these bugs in Azure DevOps", "raise these under work item #1234", "batch create ADO work items", or "turn this bug list into ADO tickets". Also trigger when the user pastes a list of issues alongside a parent work item ID, Figma link, or repro-steps URL and mentions Azure DevOps or ADO — even if they don't explicitly ask for a skill.
compatibility: >
  Requires an Azure DevOps MCP server connected (wit_work_item, wit_work_item_write, core_list_projects tools) —
  either the local server (github.com/microsoft/azure-devops-mcp) or the hosted remote server (mcp.dev.azure.com).
  Note: as of the remote server's public preview, Microsoft Entra OAuth dynamic client registration for Claude
  Code/Desktop is still rolling out — confirm the MCP tools are actually reachable before starting (see Step 0).
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.0"
---

# ADO Bug Batch Creator

Creates a set of Azure DevOps work items (Bugs or Tasks) from a plain-English list, expanding each into a
structured body and filing them as children of a parent work item.

The two work item types file their body into different fields: **Bugs use the "Bug Details" field**, **Tasks
use the "Description" field**. Because these are display names that can vary between organisations and process
templates, don't hardcode a field reference — look them up per-project in Step 2.

---

## Step 0 — Confirm the MCP connection works

Before gathering inputs, do a cheap sanity check: call `core_list_projects`. If it fails or the tools aren't
available, stop and tell the user — don't guess field names or fabricate work item IDs. This also surfaces the
organisation you're connected to, which you'll need for the summary links in Step 6.

---

## Step 1 — Gather inputs

Extract these from the conversation first; only ask for what's missing.

| Input                      | Required | Notes                                                                       |
| -------------------------- | -------- | --------------------------------------------------------------------------- |
| Bug/task list              | Yes      | Bullet points or numbered list                                              |
| Project                    | Yes      | ADO project name                                                            |
| Parent work item ID        | Yes      | e.g. `12345` — items are filed as children of this                          |
| Work item type             | Yes      | Can be one type for all (e.g. `Bug`) or specified per item                  |
| STR / repro URL            | Yes      | The URL to reproduce all bugs (or per-bug if they differ)                   |
| Design link                | Yes      | e.g. Figma — referenced in the Expected behaviour section                   |
| Area path / iteration path | No       | Only if the user specifies one; otherwise let ADO apply the project default |

If work item type is not specified, default to `Bug` and confirm with the user.

---

## Step 2 — Resolve the target field for each work item type

For every distinct work item type in play (typically `Bug` and/or `Task`), call `wit_work_item` with
action `get_type` for that project and type to get its field list. Find the field whose **display name**
matches:

- `Bug Details` for the `Bug` type
- `Description` for the `Task` type

Record each type's field reference name (e.g. something like `Custom.BugDetails` or `System.Description`) —
you'll need it in Step 4. If a matching field genuinely isn't present on a type, don't guess a substitute or
fall back silently — tell the user which field name you were looking for and ask them to confirm the right one.

---

## Step 3 — Expand each item into a structured body

For every item in the list, produce a body using this structure:

```
<b>Issue</b><br>
{1–2 sentence explanation of the problem and its impact}<br>
<br>
<b>Steps</b><br>
<ol>
<li>Navigate to: {STR URL}</li>
<li>{any prerequisite state, e.g. log in as a loyalty member}</li>
<li>{action that triggers the bug}</li>
<li>{observation step}</li>
</ol>
<b>Current behaviour</b><br>
{What is actually happening}<br>
<br>
<b>Expected behaviour</b><br>
{What should happen instead, with reference to the design: {design link}}
```

Use simple HTML rather than Markdown — ADO's long-text fields (Description, Bug Details, Repro Steps, etc.)
render as rich text, and plain Markdown syntax will show up as literal asterisks and hyphens instead of
formatting.

Guidelines for expanding descriptions:

- Be specific — name the exact element, field, or interaction involved.
- For CMS editability bugs: name the expected CMS mechanism (site string, block property, new field) and suggest a plausible field/key name.
- For accessibility bugs: reference the relevant WCAG criterion and WAI-ARIA pattern (e.g. APG Dialog Pattern for modal issues).
- For display/logic bugs: describe the exact incorrect value or behaviour observed.
- Keep STR steps at 3–5 steps. Don't pad.

---

## Step 4 — Create the work items

For each item, call `wit_work_item_write` with action `add_child` (filing it under the parent from Step 1):

```
project:        {project}
parentId:       {parent work item ID}
workItemType:   {Bug | Task | as specified per item}
fields:
  System.Title: {concise, specific summary — not a copy of the raw bug note}
  {field reference from Step 2}: {expanded body from Step 3}
  System.AreaPath:      {only if the user specified one}
  System.IterationPath: {only if the user specified one}
```

Check the tool's own input schema before calling it — the exact parameter names (e.g. `project` vs
`projectName`, `parentId` vs `parentWorkItemId`) can differ slightly between the local and remote MCP builds,
and the schema is the source of truth over anything memorised here.

Write summaries that are specific and self-contained. Avoid vague starters like "Bug:" or "Issue with...".
Good examples:

- `Modal subheading 'Stay & Dine' not CMS editable — no field on block`
- `Keyboard focus not trapped within modal — tab order escapes to page behind overlay`

Create work items sequentially. After all are created, present a summary table.

---

## Step 5 — Summary output

After all work items are created, output a markdown table:

| #   | ID    | Title | Link                                                        |
| --- | ----- | ----- | ----------------------------------------------------------- |
| 1   | 12346 | ...   | https://dev.azure.com/{org}/{project}/_workitems/edit/12346 |

Note any items that failed to create and why.

---

## Edge cases

- **Mixed work item types**: If the user specifies different types per item (e.g. most are `Bug` but one is a `Task`), honour that per item — and resolve the correct target field (Step 2) for each type used, not just the first one.
- **No parent**: If no parent is given, create top-level work items in the project instead — confirm with the user first, then use `wit_work_item_write` action `create` rather than `add_child`.
- **No STR URL**: If none is provided, omit the Steps section rather than fabricating a URL.
- **No design link**: Omit the design reference from Expected behaviour rather than leaving a broken placeholder.
- **Field not found**: If "Bug Details" or "Description" isn't on the work item type as expected, ask the user rather than silently writing to a different field — a body landing in the wrong field is easy to miss and annoying to fix across a batch.
