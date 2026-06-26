$Ha = "hassio@ha.home"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$LocalSrcDir = Join-Path $RepoRoot "src"
$RemoteDir = "/config/www/bp-entry-card"
$RemoteTmpDir = "/tmp/bp-entry-card-src"

scp -O -r $LocalSrcDir "$Ha`:$RemoteTmpDir"

if ($LASTEXITCODE -ne 0) {
    throw "scp failed"
}

ssh $Ha "sudo rm -rf '$RemoteDir' && sudo mkdir -p '$RemoteDir' && sudo cp -a '$RemoteTmpDir/.' '$RemoteDir/' && sudo chmod -R a+rX '$RemoteDir' && sudo rm -rf '$RemoteTmpDir'"

if ($LASTEXITCODE -ne 0) {
    throw "remote install failed"
}

Write-Host "Deployed all files from $LocalSrcDir to $RemoteDir"
