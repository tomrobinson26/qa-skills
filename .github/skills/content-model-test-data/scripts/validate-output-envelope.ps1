param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath
)

if (-not (Test-Path -Path $InputPath)) {
    Write-Error "Input file not found: $InputPath"
    exit 1
}

try {
    $raw = Get-Content -Path $InputPath -Raw -Encoding UTF8
    $json = $raw | ConvertFrom-Json -Depth 100
}
catch {
    Write-Error "Invalid JSON. Ensure output is strict JSON with no prose or markdown."
    exit 1
}

$requiredMeta = @("industry", "industrySource", "recordCount", "modelName", "generatedAt", "notes")

if (-not $json.PSObject.Properties.Name.Contains("meta")) {
    Write-Error "Missing top-level property: meta"
    exit 1
}

if (-not $json.PSObject.Properties.Name.Contains("records")) {
    Write-Error "Missing top-level property: records"
    exit 1
}

foreach ($field in $requiredMeta) {
    if (-not $json.meta.PSObject.Properties.Name.Contains($field)) {
        Write-Error "Missing meta field: $field"
        exit 1
    }
}

if ($json.meta.industrySource -notin @("inferred", "provided", "generic-default")) {
    Write-Error "meta.industrySource must be one of: inferred, provided, generic-default"
    exit 1
}

if ($json.records -isnot [System.Collections.IEnumerable]) {
    Write-Error "records must be an array"
    exit 1
}

$actualCount = @($json.records).Count
if ([int]$json.meta.recordCount -ne $actualCount) {
    Write-Error "meta.recordCount ($($json.meta.recordCount)) does not match records length ($actualCount)"
    exit 1
}

Write-Output "Validation passed. Envelope is structurally valid."
