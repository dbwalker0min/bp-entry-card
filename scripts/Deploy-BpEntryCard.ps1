$Ha = "hassio@ha.home"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$LocalFile = Join-Path $RepoRoot "src\bp-entry-card.js"
$RemoteDir = "/config/www/bp-entry-card"
$RemoteTmp = "/tmp/bp-entry-card.js"
$RemoteFile = "$RemoteDir/bp-entry-card.js"

scp -O $LocalFile "$Ha`:$RemoteTmp"

if ($LASTEXITCODE -ne 0) {
    throw "scp failed"
}

ssh $Ha "sudo mkdir -p $RemoteDir && sudo mv $RemoteTmp $RemoteFile && sudo chmod 644 $RemoteFile"

if ($LASTEXITCODE -ne 0) {
    throw "remote install failed"
}

Write-Host "Deployed to $RemoteFile"
