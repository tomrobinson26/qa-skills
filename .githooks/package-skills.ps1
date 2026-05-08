$ErrorActionPreference = 'Stop'

$repoRoot  = git rev-parse --show-toplevel
$skillsDir = Join-Path $repoRoot ".github/skills"
$distDir   = Join-Path $repoRoot "dist"

New-Item -ItemType Directory -Path $distDir -Force | Out-Null

Get-ChildItem $skillsDir -Directory | ForEach-Object {
    & "$repoRoot/package-skill.ps1" $_.FullName -OutputDir $distDir
}

# Stage any new or modified .skill files
git -C $repoRoot add (Join-Path $distDir "*.skill")

$staged = git -C $repoRoot diff --cached --name-only -- "dist/*.skill"
if ($staged) {
    git -C $repoRoot commit -m "chore: update packaged .skill files [skip ci]"
    Write-Host "pre-push: committed updated .skill files"
}
