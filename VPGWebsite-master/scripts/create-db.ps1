<#
  create-db.ps1
  - Reads DATABASE_URL from .env (or parameter)
  - Uses local `psql` (PostgreSQL client) to create the database if it doesn't exist
  - Runs Prisma generate and migrate

  Usage (PowerShell):
    ./scripts/create-db.ps1

  Notes:
  - This script requires `psql` in PATH (install PostgreSQL or psql client).
  - It will attempt to connect to the server using credentials in DATABASE_URL.
  - If you prefer to create DB manually, run the shown psql command yourself.
#>

Param(
  [string]$EnvFile = ".env"
)

Write-Host "Reading $EnvFile for DATABASE_URL..."
$dbUrl = ""
if (Test-Path $EnvFile) {
  $envContent = Get-Content $EnvFile -Raw
  if ($envContent -match 'DATABASE_URL\s*=\s*"([^"]+)"') {
    $dbUrl = $matches[1]
  } elseif ($envContent -match 'DATABASE_URL\s*=\s*(\S+)') {
    $dbUrl = $matches[1]
  }
}

if (-not $dbUrl) {
  Write-Error "No DATABASE_URL found in $EnvFile. Please set DATABASE_URL in the file or pass one to the script."
  exit 1
}

# Extract components using regex: postgresql://user:pass@host:port/dbname
if ($dbUrl -match '^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^\?]+)') {
  $dbUser = $matches[1]
  $dbPass = $matches[2]
  $dbHost = $matches[3]
  $dbPort = $matches[4]
  $dbName = $matches[5]
} else {
  Write-Error "DATABASE_URL format not recognized: $dbUrl"
  exit 1
}

Write-Host "Database connection info: host=$dbHost port=$dbPort db=$dbName user=$dbUser"

# Check for psql
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
  Write-Error "psql not found in PATH. Install PostgreSQL client tools or create the database manually."
  exit 1
}

# Attempt to create database by connecting to default 'postgres' database
Write-Host "Creating database '$dbName' if not exists..."
$env:PGPASSWORD = $dbPass
$createCmd = "psql -h $dbHost -U $dbUser -p $dbPort -d postgres -c \"CREATE DATABASE \"\"$dbName\"\";\""
Write-Host "Running: $createCmd"
try {
  & psql -h $dbHost -U $dbUser -p $dbPort -d postgres -c "CREATE DATABASE \"$dbName\";" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Database may already exist or creation returned non-zero code. Continuing..."
  } else {
    Write-Host "Database created or already existed."
  }
} catch {
  Write-Warning "Could not create database automatically: $_. Exception.Message"
  Write-Host "You can create the database manually using the following command (replace password when prompted):"
  Write-Host "psql -h $dbHost -U $dbUser -p $dbPort -d postgres -c \"CREATE DATABASE \"$dbName\";\""
  exit 1
}

Write-Host "Running Prisma generate and migrate..."
npm run prisma:generate

# Run migrate dev (will apply migrations)
npx prisma migrate dev --name apply-schema --skip-seed

Write-Host "If you have a seed script configured, run: npx prisma db seed"
Write-Host "Done. Start the app: npm run dev"
