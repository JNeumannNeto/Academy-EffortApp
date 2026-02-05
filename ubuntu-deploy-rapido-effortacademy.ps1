# ============================================
# Deploy Rápido - Apenas EffortAcademy (OTIMIZADO)
# ============================================
# Compacta ANTES de enviar (muito mais rápido!)

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploy Rápido EffortAcademy (OTIMIZADO + ENV CORRETO)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Detect `Academy-EffortApp` automaticamente when running from repo root
$cwd = (Get-Location).ProviderPath
if (Test-Path (Join-Path $cwd 'Academy-EffortApp')) {
  $BaseDir = Join-Path $cwd 'Academy-EffortApp'
} elseif ((Split-Path $cwd -Leaf) -ieq 'Academy-EffortApp') {
  $BaseDir = $cwd
} else {
  $found = Get-ChildItem -Directory -Path $cwd -Filter 'Academy-EffortApp' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $BaseDir = $found.FullName } else { Write-Host "Não encontrei a pasta 'Academy-EffortApp' a partir de: $cwd" -ForegroundColor Red; exit 1 }
}

$TempDir = "/tmp/deploy-effortacademy-$PID"

Set-Location $BaseDir

# 0. Usar .env.local do projeto, se existir
Write-Host "`n🔧 Verificando .env.local..." -ForegroundColor Cyan
$envLocalPath = Join-Path $BaseDir '.env.local'
if (Test-Path $envLocalPath) {
  Write-Host "✓ Usando .env.local existente do projeto." -ForegroundColor Green
} else {
  Write-Host "⚠ .env.local não encontrado no projeto, criando padrão." -ForegroundColor Yellow
  $envContent = @"
NEXT_PUBLIC_API_URL=https://academyserver.jneumann.com.br
PORT=3001
"@
  Set-Content -Path $envLocalPath -Value $envContent -NoNewline -Encoding UTF8
}
Get-Content $envLocalPath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# 1. Build COM .env.local correto
Write-Host "`n📦 Fazendo build com API URL correto..." -ForegroundColor Cyan
Remove-Item -Path (Join-Path $BaseDir '.next') -Recurse -Force -ErrorAction SilentlyContinue
npm run build

# 2. Criar diretório temporário
if (-not (Test-Path $TempDir)) { New-Item -ItemType Directory -Path $TempDir | Out-Null }

# 3. Criar tar.gz com .next, public e .env.local
Write-Host "`n📦 Compactando arquivos em tar.gz..." -ForegroundColor Cyan
$archive = Join-Path $TempDir 'effortacademy-build.tar.gz'

# Copia o script de deploy para a pasta do projeto antes de compactar

$deployScript = Join-Path $cwd 'deploy-remote-effortacademy.sh'
if (Test-Path $deployScript) {
  $destScript = Join-Path $BaseDir 'deploy-remote-effortacademy.sh'
  if ($deployScript -ne $destScript) {
    Copy-Item $deployScript -Destination $BaseDir -Force
  }
} else {
  Write-Host "⚠ Script deploy-remote-effortacademy.sh não encontrado em $cwd!" -ForegroundColor Yellow
}

if (Get-Command tar -ErrorAction SilentlyContinue) {
  & tar -C $BaseDir -czf $archive .next public .env.local deploy-remote-effortacademy.sh
} else {
  Write-Host "Aviso: 'tar' não encontrado. Usando zip como fallback..." -ForegroundColor Yellow
  $archiveZip = Join-Path $TempDir 'effortacademy-build.zip'
  if (-not (Get-Command zip -ErrorAction SilentlyContinue)) {
    Write-Host "Por favor instale 'zip' ou 'tar' no sistema." -ForegroundColor Red
    exit 1
  }
  Push-Location $BaseDir
  & zip -r -q $archiveZip .next public .env.local deploy-remote-effortacademy.sh
  Pop-Location
  $archive = $archiveZip
}

$zipSize = [math]::Round((Get-Item $archive).Length/1MB, 2)
Write-Host "  ✓ Arquivo criado: $zipSize MB" -ForegroundColor Green

# 4. Enviar ZIP para EC2
Write-Host "`n📤 Enviando para EC2 ($zipSize MB)..." -ForegroundColor Cyan

# Converter caminhos Windows (ex: D:\projetos\...) para Linux (/media/USER/Pessoal/...) se necessário
if ($KeyPath -match '^[A-Za-z]:\\') {
  $kp = $KeyPath -replace '\\','/'
  $drive = $kp.Substring(0,1).ToLower()
  $rest = $kp.Substring(2).TrimStart('/')
  if ($drive -eq 'd') { $KeyPath = "/media/$env:USER/Pessoal/$rest" } else { $KeyPath = "/mnt/$drive/$rest" }
} else {
  $KeyPath = $KeyPath -replace '\\','/'
}

if (-not (Test-Path $KeyPath)) { Write-Host "Arquivo de chave não encontrado: $KeyPath" -ForegroundColor Red; exit 1 }


# Envia o arquivo tar.gz para a instância
scp -i $KeyPath $archive "ubuntu@${EC2_IP}:/tmp/"

# Envia o script de deploy para /var/www/academia na instância
$deployScriptPath = Join-Path $BaseDir 'deploy-remote-effortacademy.sh'
scp -i $KeyPath $deployScriptPath "ubuntu@${EC2_IP}:/var/www/academia/"


Write-Host "\nConecte via SSH na EC2, navegue até a pasta do projeto e execute o script de deploy manualmente:" -ForegroundColor Yellow
Write-Host "cd /var/www/academia/effortacademy" -ForegroundColor Yellow
Write-Host "bash deploy-remote-effortacademy.sh" -ForegroundColor Yellow

# 6. Limpar arquivo local
Write-Host "`n🧹 Limpando arquivos temporários..." -ForegroundColor Cyan
Remove-Item -Path $archive -ErrorAction SilentlyContinue
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# 7. Resumo
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ Deploy concluído com API URL correto!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 API configurada: https://academyserver.jneumann.com.br" -ForegroundColor Cyan
Write-Host "🌐 Acesse: https://effortacademy.jneumann.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Aguarde 30 segundos e tente acessar!" -ForegroundColor Yellow
