[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [string] $SkillPath,

    [Parameter(Position = 1)]
    [string] $OutputDir = (Get-Location).Path
)

$resolved = Resolve-Path $SkillPath -ErrorAction Stop
$skillDir  = $resolved.Path

if (-not (Test-Path $skillDir -PathType Container)) {
    Write-Error "'$skillDir' is not a directory."
    exit 1
}

$skillName  = Split-Path $skillDir -Leaf
$outputFile = Join-Path $OutputDir "$skillName.skill"

# Copy to a temp dir, strip .distribute, then zip — so the marker never ends up in the archive
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
Copy-Item $skillDir $tempDir -Recurse
Remove-Item (Join-Path $tempDir '.distribute') -ErrorAction SilentlyContinue

$tempZip = [System.IO.Path]::ChangeExtension($outputFile, 'zip')
if (Test-Path $tempZip)    { Remove-Item $tempZip    -Force }
if (Test-Path $outputFile) { Remove-Item $outputFile -Force }

# Use ZipFile directly so entry paths use forward slashes on all platforms.
# Compress-Archive writes backslash separators on Windows, which breaks uploads.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($tempZip, 'Create')
try {
    Get-ChildItem $tempDir -Recurse -File | ForEach-Object {
        $entryName = $_.FullName.Substring($tempDir.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName) | Out-Null
    }
} finally {
    $zip.Dispose()
}
Rename-Item -Path $tempZip -NewName "$skillName.skill"
Remove-Item $tempDir -Recurse -Force

Write-Host "Packaged '$skillName' -> $outputFile"
