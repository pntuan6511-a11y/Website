Cleaning build artifacts and Docker caches (PowerShell)

Run these commands from project root to safely clean local build artifacts and reclaim disk space after Docker builds.

# Remove Next.js build and local uploads (be careful - this deletes files):
Remove-Item -Recurse -Force .\.next
Remove-Item -Recurse -Force .\uploads
Remove-Item -Recurse -Force .\public\uploads

# Remove node_modules (optional if you want a fresh install):
Remove-Item -Recurse -Force .\node_modules

# Prune Docker system (images, containers, volumes, networks) - prompt before deleting:
docker system prune --all --volumes

Notes:
- Only remove `./uploads` if you've backed up or you intentionally want to clear uploaded files on host.
- In CI/CD or production, prefer using named volumes or external storage for persistence instead of deleting host folders.
