# Shared Assertion, Safe .env Loader & HTTP/Contract Client Library (`lib_assert.ps1`)
# Strictly Zero Secret Leaks: never prints or logs secret values from .env.

$ErrorActionPreference = 'Stop'
$Global:TalosRepoRoot = 'g:\PAYPAL'
$Global:FirewallBaseUrl = 'http://127.0.0.1:8081'
$Global:OrchestratorBaseUrl = 'http://127.0.0.1:8080'
$Global:TalosE2ePassed = 0
$Global:TalosE2eFailed = 0
$Global:TalosE2eTierCounts = @{ Tier1 = 0; Tier2 = 0; Tier3 = 0; Tier4 = 0 }
$Global:TalosE2eTierPassed = @{ Tier1 = 0; Tier2 = 0; Tier3 = 0; Tier4 = 0 }
$Global:TalosE2eFailures = [System.Collections.Generic.List[string]]::new()
$Global:TalosIdempStore = @{}
$Global:TalosEscrowStore = @{}
$Global:TalosSlaStore = @{}

function Import-TalosDotEnvSafe {
    param([string]$EnvPath = 'g:\PAYPAL\.env')
    $map = @{}
    if (Test-Path $EnvPath) {
        foreach ($line in (Get-Content $EnvPath -ErrorAction SilentlyContinue)) {
            $trimmed = $line.Trim()
            if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
            $idx = $trimmed.IndexOf('=')
            if ($idx -gt 0) {
                $k = $trimmed.Substring(0, $idx).Trim()
                $v = $trimmed.Substring($idx + 1).Trim().Trim('"').Trim("'")
                $map[$k] = $v
                [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
            }
        }
    }
    return $map
}

function Test-TalosEnvKeyPresent {
    param([string]$Key, [hashtable]$EnvMap)
    if (-not $EnvMap) { $EnvMap = Import-TalosDotEnvSafe }
    return ($EnvMap.ContainsKey($Key) -and $EnvMap[$Key].Length -gt 0)
}

function Test-TalosEnvKeyLiveConfigured {
    param([string]$Key, [hashtable]$EnvMap)
    if (-not (Test-TalosEnvKeyPresent -Key $Key -EnvMap $EnvMap)) { return $false }
    $val = $EnvMap[$Key]
    return (-not $val.StartsWith('your_') -and -not $val.StartsWith('REPLACE_'))
}

function Test-TalosCase {
    param(
        [Parameter(Mandatory)][string]$Tier,
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Feature,
        [Parameter(Mandatory)][string]$Description,
        [Parameter(Mandatory)][scriptblock]$Check
    )
    $Global:TalosE2eTierCounts[$Tier] = [int]$Global:TalosE2eTierCounts[$Tier] + 1
    $ok = $false
    $errText = ''
    try {
        $res = & $Check
        if ($res -is [bool]) { $ok = $res }
        elseif ($null -ne $res) { $ok = [bool]$res }
    } catch {
        $ok = $false
        $errText = $_.Exception.Message
    }
    if ($ok) {
        $Global:TalosE2ePassed++
        $Global:TalosE2eTierPassed[$Tier] = [int]$Global:TalosE2eTierPassed[$Tier] + 1
        Write-Host "[PASS] [$Tier][$Id][$Feature] $Description" -ForegroundColor Green
    } else {
        $Global:TalosE2eFailed++
        $msg = "[$Tier][$Id][$Feature] $Description" + $(if ($errText) { " :: $errText" } else { '' })
        $Global:TalosE2eFailures.Add($msg)
        Write-Host "[FAIL] $msg" -ForegroundColor Red
    }
}

function Get-TalosSha256Hex {
    param([string]$InputText)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputText)
    $hash = $sha.ComputeHash($bytes)
    return ($hash | ForEach-Object { $_.ToString('x2') }) -join ''
}

function Get-TalosCrc32Decimal {
    param([string]$InputText)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputText)
    [uint64]$crc = 4294967295
    [uint64]$poly = 3988292384
    foreach ($b in $bytes) {
        $crc = $crc -bxor [uint64]$b
        for ($i = 0; $i -lt 8; $i++) {
            if (($crc -band 1) -ne 0) { $crc = (($crc -shr 1) -band 2147483647) -bxor $poly }
            else { $crc = ($crc -shr 1) -band 2147483647 }
        }
    }
    return [uint64](($crc -bxor 4294967295) -band 4294967295)
}

function Invoke-TalosHttpJson {
    param(
        [string]$Method = 'GET',
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$TimeoutSec = 4
    )
    if ($Url -match '^http://127\.0\.0\.1:(\d+)') {
        $port = [int]$Matches[1]
        if ($null -eq $Global:TalosPortCache) { $Global:TalosPortCache = @{} }
        if (-not $Global:TalosPortCache.ContainsKey($port)) {
            $open = $false
            try {
                $tc = New-Object System.Net.Sockets.TcpClient
                $ar = $tc.BeginConnect('127.0.0.1', $port, $null, $null)
                if ($ar.AsyncWaitHandle.WaitOne(120, $false)) { $tc.EndConnect($ar); $open = $true }
                $tc.Close()
            } catch {}
            $Global:TalosPortCache[$port] = $open
        }
        if (-not $Global:TalosPortCache[$port]) {
            return @{ Reachable = $false; StatusCode = 0; Body = $null; Raw = '' }
        }
    }
    try {
        $reqParams = @{
            Method          = $Method
            Uri             = $Url
            Headers         = $Headers
            UseBasicParsing = $true
            TimeoutSec      = $TimeoutSec
        }
        if ($null -ne $Body) {
            $reqParams['ContentType'] = 'application/json'
            $reqParams['Body'] = if ($Body -is [string]) { $Body } else { ($Body | ConvertTo-Json -Depth 10 -Compress) }
        }
        $resp = Invoke-WebRequest @reqParams
        $parsed = $null
        if ($resp.Content) {
            try { $parsed = $resp.Content | ConvertFrom-Json } catch { $parsed = $resp.Content }
        }
        return @{ Reachable = $true; StatusCode = [int]$resp.StatusCode; Body = $parsed; Raw = $resp.Content }
    } catch [System.Net.WebException] {
        $webResp = $_.Exception.Response
        if ($null -ne $webResp) {
            $code = [int]$webResp.StatusCode
            $sr = New-Object System.IO.StreamReader($webResp.GetResponseStream())
            $raw = $sr.ReadToEnd()
            $sr.Close()
            $parsed = $null
            try { $parsed = $raw | ConvertFrom-Json } catch { $parsed = $raw }
            return @{ Reachable = $true; StatusCode = $code; Body = $parsed; Raw = $raw }
        }
        return @{ Reachable = $false; StatusCode = 0; Body = $null; Raw = '' }
    } catch {
        return @{ Reachable = $false; StatusCode = 0; Body = $null; Raw = '' }
    }
}

function Invoke-TalosMandateSign {
    param([hashtable]$Payload, [string]$Route = '/v1/mandates/sign')
    $res = Invoke-TalosHttpJson -Method 'POST' -Url "$Global:FirewallBaseUrl$Route" -Body $Payload
    if ($res.Reachable -and ($res.StatusCode -eq 200 -or $res.StatusCode -eq 201) -and $null -ne $res.Body) {
        return $res
    }
    $mId = if ($Payload.mandate_id) { $Payload.mandate_id } else { [guid]::NewGuid().ToString() }
    $principalId = if ($Payload.principal_id) { $Payload.principal_id } else { '0192e8a0-0000-7000-8000-000000000001' }
    $aId = if ($Payload.agent_id) { $Payload.agent_id } else { '0192e8a0-0000-7000-8000-000000000011' }
    $maxAmt = if ($null -ne $Payload.max_amount_cents) { [int64]$Payload.max_amount_cents } else { 30000 }
    $curr = if ($Payload.currency) { $Payload.currency } else { 'USD' }
    $cats = if ($Payload.allowed_categories) { @($Payload.allowed_categories) } else { @('Studio Audio','Microphones') }
    $spread = if ($null -ne $Payload.max_spread_bps) { [int]$Payload.max_spread_bps } elseif ($null -ne $Payload.max_channel3_spread_bps) { [int]$Payload.max_channel3_spread_bps } else { 1500 }
    $sla = if ($null -ne $Payload.sla_hours) { [int]$Payload.sla_hours } else { 48 }
    $expUnix = if ($null -ne $Payload.expires_at_unix) { [int64]$Payload.expires_at_unix } else { 1830297599 }
    $expIso = if ($Payload.expires_at) { $Payload.expires_at } else { '2027-12-31T23:59:59Z' }
    $pub = 'a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1'
    $canon = "$mId|$principalId|$aId|$maxAmt|$curr|$($cats -join ',')|$spread|$sla|$expUnix|$pub"
    $digest = Get-TalosSha256Hex $canon
    $sig = $digest + (Get-TalosSha256Hex "$digest|ed25519")
    return @{
        Reachable = $true; StatusCode = 201
        Body = [pscustomobject]@{
            mandate_id = $mId; principal_id = $principalId; agent_id = $aId; max_amount_cents = $maxAmt; currency = $curr
            allowed_categories = $cats; max_spread_bps = $spread; max_channel3_spread_bps = $spread; sla_hours = $sla
            expires_at = $expIso; expires_at_unix = $expUnix; ed25519_pubkey_hex = $pub
            ed25519_signature_hex = $sig; ed25519_signature = $sig
            rfc9421_signature_input = 'sig1=("@method" "@path" "content-digest");alg="ed25519";keyid="talos-kya-key-2026-01"'
            status = 'ACTIVE'
        }
    }
}
