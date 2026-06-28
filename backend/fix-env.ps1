$envPath = "C:\kreatixtech\backend\.env"
$lines = Get-Content $envPath
$clean = $lines | Where-Object { $_ -notmatch "DATABASE_URL" }
$clean | Set-Content $envPath -Encoding UTF8
Add-Content $envPath 'DATABASE_URL=psql postgresql://neondb_owner:npg_GdCT0SD4hRJY@ep-broad-boat-atzfsshg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -Encoding UTF8
Write-Host "Updated DATABASE_URL"
