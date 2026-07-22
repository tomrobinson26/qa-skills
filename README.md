# QA Skills

A collection of AI skills for QA workflows — test generation, refinement docs, design verification, and more.

Skills come in two flavours:

| Type              | Description                                        | Released as `.skill`? |
| ----------------- | -------------------------------------------------- | --------------------- |
| **Distributable** | Web-based skills for Claude.ai                     | Yes                   |
| **IDE-only**      | Skills for GitHub Copilot or local development use | No                    |

---

## Skill structure

Each skill lives in `skills/<skill-name>/` and must contain a `SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill
description: When and how to use this skill.
---
```

To mark a skill as distributable, add an empty `.distribute` file to its folder:

```
skills/my-skill/
├── SKILL.md
├── .distribute       ← presence of this file triggers packaging
└── ...
```

Skills without a `.distribute` file are ignored during packaging. The `.distribute` file is never included in the packaged `.skill` archive.

---

## Releases

Releases are created by pushing a version tag. The GitHub Actions workflow checks out the committed code, packages every distributable skill into a `.skill` file (a zip with a `.skill` extension), and attaches them to a GitHub Release. The release pipeline also handles regeneration of the marketplace index file.

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow then appears under **Actions → Release Skills** and the `.skill` files are available as downloadable assets on the release.

---

## Adding a skill to claude.ai (Claude for Web)

1. Download the relevant skills from the [latest release](https://github.com/tomrobinson26/qa-skills/releases).
2. Go to [skills in Claude.ai](https://claude.ai/customize/skills)
3. Upload the .skill file

---

## Local packaging

To package a skill locally (for testing):

```bash
bash scripts/package-skill.sh skills/<skill-name>

# Output to a specific directory
bash scripts/package-skill.sh skills/<skill-name> dist/
```

This does not affect releases — releases always build from committed code in CI.

---

## Adding a new skill

1. Create a folder under `skills/<skill-name>/`
2. Add a `SKILL.md` with the required frontmatter
3. Add an empty `.distribute` file to the folder if it should be included in releases
4. Commit and push — tag a new version when ready to release
