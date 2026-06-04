<#
.SYNOPSIS
    Generates .claude-plugin/marketplace.json from SKILL.md frontmatter.

.DESCRIPTION
    Scans all skills/*/SKILL.md files, parses their YAML frontmatter, and
    rebuilds the plugins array in .claude-plugin/marketplace.json.

    Preserved from the existing marketplace.json:
      - description   (human-curated; auto-generated only for new plugins)
      - keywords      (always preserved; set manually per plugin)
      - strict        (always preserved)

    Always synced from SKILL.md:
      - name, version, source path

    Top-level metadata (name, owner, metadata.version) is never modified.

.PARAMETER Check
    If set, exits with code 1 if marketplace.json would change. Used by
    the pre-commit hook to fail the commit when the file is stale.

.EXAMPLE
    powershell -File scripts/generate-marketplace.ps1
    powershell -File scripts/generate-marketplace.ps1 -Check
#>

param(
    [switch]$Check
)

$ErrorActionPreference = 'Stop'

$repoRoot        = Split-Path -Parent $PSScriptRoot
$marketplacePath = Join-Path $repoRoot '.claude-plugin\marketplace.json'
$skillsRoot      = Join-Path $repoRoot 'skills'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Format-Json {
    <#
    Converts any JSON string (including PS 5.1's bloated ConvertTo-Json output)
    into clean, 2-space indented JSON with single spaces after colons.
    Works by parsing the compact form character-by-character.
    #>
    param([string]$Json, [int]$IndentSize = 2)

    # Start from compact JSON so we control all whitespace from scratch
    # (PS 5.1 ConvertTo-Json -Compress still adds spaces; strip them ourselves)
    $sb       = [System.Text.StringBuilder]::new($Json.Length * 2)
    $indent   = 0
    $inString = $false
    $escape   = $false

    foreach ($char in $Json.ToCharArray()) {
        if ($escape) {
            [void]$sb.Append($char)
            $escape = $false
            continue
        }

        if ($inString) {
            [void]$sb.Append($char)
            if     ($char -eq '"') { $inString = $false }
            elseif ($char -eq '\') { $escape = $true }
            continue
        }

        switch ($char) {
            '"' {
                [void]$sb.Append($char)
                $inString = $true
            }
            '{' {
                [void]$sb.Append('{')
                $indent++
                [void]$sb.Append("`n")
                [void]$sb.Append(' ' * ($indent * $IndentSize))
            }
            '}' {
                $indent--
                [void]$sb.Append("`n")
                [void]$sb.Append(' ' * ($indent * $IndentSize))
                [void]$sb.Append('}')
            }
            '[' {
                [void]$sb.Append('[')
                $indent++
                [void]$sb.Append("`n")
                [void]$sb.Append(' ' * ($indent * $IndentSize))
            }
            ']' {
                $indent--
                [void]$sb.Append("`n")
                [void]$sb.Append(' ' * ($indent * $IndentSize))
                [void]$sb.Append(']')
            }
            ',' {
                [void]$sb.Append(',')
                [void]$sb.Append("`n")
                [void]$sb.Append(' ' * ($indent * $IndentSize))
            }
            ':' {
                [void]$sb.Append(': ')
            }
            # Skip all whitespace — we control it ourselves
            ' '   { }
            "`t"  { }
            "`r"  { }
            "`n"  { }
            default { [void]$sb.Append($char) }
        }
    }

    return $sb.ToString()
}

function Get-FirstSentence {
    param([string]$text)
    $text = $text.Trim()
    $dotIndex = $text.IndexOf('.')
    if ($dotIndex -ge 0 -and $dotIndex -lt 160) {
        return $text.Substring(0, $dotIndex + 1).Trim()
    }
    # No early period — cap at 160 chars at a word boundary
    if ($text.Length -le 160) { return $text }
    $cut = $text.Substring(0, 160)
    $lastSpace = $cut.LastIndexOf(' ')
    if ($lastSpace -gt 0) { return $cut.Substring(0, $lastSpace).Trim() }
    return $cut.Trim()
}

function Read-SkillFrontmatter {
    param([string]$skillDir)

    $skillFile = Join-Path $skillDir 'SKILL.md'
    if (-not (Test-Path $skillFile)) { return $null }

    # Use UTF-8 explicitly so em dashes and other Unicode survive on PS 5.1
    $raw = [System.IO.File]::ReadAllText($skillFile, [System.Text.Encoding]::UTF8)

    # Must start with a frontmatter block
    if ($raw -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return $null }
    $fm = $Matches[1]

    $result = @{}

    # name
    if ($fm -match '(?m)^name:\s*(.+)$') {
        $result.name = $Matches[1].Trim().Trim('"').Trim("'")
    }

    # description — handle block folded scalar (>) or inline (quoted/bare)
    if ($fm -match '(?s)(?m)^description:\s*>\r?\n((?:[ \t]+[^\r\n]*\r?\n?)+)') {
        $block = $Matches[1]
        $result.description = ($block -split '\r?\n' |
            ForEach-Object { $_.Trim() } |
            Where-Object { $_ }) -join ' '
    } elseif ($fm -match "(?m)^description:\s*'((?:[^']|'')*)'") {
        $result.description = $Matches[1]
    } elseif ($fm -match '(?m)^description:\s*"((?:[^"\\]|\\.)*)"') {
        $result.description = $Matches[1]
    } elseif ($fm -match '(?m)^description:\s*(.+)$') {
        $result.description = $Matches[1].Trim()
    }

    # version — nested under metadata:
    if ($fm -match '(?m)^\s+version:\s*"?([0-9][^\s"]*)"?') {
        $result.version = $Matches[1].Trim()
    }

    return $result
}

# ---------------------------------------------------------------------------
# Load existing marketplace.json
# ---------------------------------------------------------------------------

if (-not (Test-Path $marketplacePath)) {
    Write-Error "marketplace.json not found at: $marketplacePath"
    exit 1
}

$existing       = [System.IO.File]::ReadAllText($marketplacePath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$existingByName = @{}
foreach ($p in $existing.plugins) {
    $existingByName[$p.name] = $p
}

# ---------------------------------------------------------------------------
# Scan skills
# ---------------------------------------------------------------------------

$plugins = [System.Collections.Generic.List[object]]::new()

Get-ChildItem -Path $skillsRoot -Directory |
    Sort-Object Name |
    ForEach-Object {
        $meta = Read-SkillFrontmatter -skillDir $_.FullName
        if ($null -eq $meta -or -not $meta.name) { return }

        $name = $meta.name
        $prev = $existingByName[$name]

        # Description: preserve existing human-curated text; fall back to
        # auto-generated first sentence only for newly discovered plugins.
        $desc = if ($null -ne $prev -and $prev.description -and $prev.description -ne '') {
            $prev.description
        } elseif ($meta.description) {
            Get-FirstSentence -text $meta.description
        } else {
            ''
        }

        $plugin = [ordered]@{
            name        = $name
            description = $desc
            source      = "./skills/$($_.Name)"
            strict      = if ($null -ne $prev -and $null -ne $prev.strict) { [bool]$prev.strict } else { $false }
            version     = if ($meta.version) { $meta.version } else { '1.0.0' }
            keywords    = if ($null -ne $prev -and $prev.keywords) { @($prev.keywords) } else { @() }
        }

        $plugins.Add($plugin)
    }

# ---------------------------------------------------------------------------
# Build updated marketplace object
# ---------------------------------------------------------------------------

$marketplace = [ordered]@{
    name     = $existing.name
    owner    = $existing.owner
    metadata = $existing.metadata
    plugins  = @($plugins)
}

$newJson = Format-Json ($marketplace | ConvertTo-Json -Depth 10 -Compress)

# ---------------------------------------------------------------------------
# Check mode or write
# ---------------------------------------------------------------------------

if ($Check) {
    $currentJson = [System.IO.File]::ReadAllText($marketplacePath, [System.Text.Encoding]::UTF8)
    # Normalise line endings for comparison
    $currentNorm = $currentJson -replace '\r\n', "`n"
    $newNorm     = $newJson     -replace '\r\n', "`n"
    if ($currentNorm.TrimEnd() -ne $newNorm.TrimEnd()) {
        Write-Host "ERROR: .claude-plugin/marketplace.json is out of date." -ForegroundColor Red
        Write-Host "Run 'powershell -File scripts/generate-marketplace.ps1' to update it." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "marketplace.json is up to date. ($($plugins.Count) plugins)" -ForegroundColor Green
    exit 0
}

# Write with a trailing newline
[System.IO.File]::WriteAllText($marketplacePath, ($newJson + "`n"), [System.Text.Encoding]::UTF8)
Write-Host "Updated marketplace.json with $($plugins.Count) plugins." -ForegroundColor Green
