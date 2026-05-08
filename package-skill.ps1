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

# Build into a temp zip then rename so we can guarantee the .skill extension
$tempZip = [System.IO.Path]::ChangeExtension($outputFile, 'zip')

if (Test-Path $tempZip) { Remove-Item $tempZip -Force }
if (Test-Path $outputFile) { Remove-Item $outputFile -Force }

Compress-Archive -Path (Join-Path $skillDir '*') -DestinationPath $tempZip
Rename-Item -Path $tempZip -NewName "$skillName.skill"

Write-Host "Packaged '$skillName' -> $outputFile"
