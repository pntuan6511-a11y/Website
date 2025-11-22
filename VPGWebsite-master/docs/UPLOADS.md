Production uploads configuration

This project supports configuring where uploaded files are stored using the `UPLOADS_DIR` environment variable.

Behavior

- If `UPLOADS_DIR` is not set, the API will use `public/uploads` inside the project (default).
- If `UPLOADS_DIR` is a relative path, it is resolved relative to the project root and the public URL will be `/<UPLOADS_DIR>/<filename>`.
- If `UPLOADS_DIR` is an absolute path (starts with `/`), the API will write files to that absolute path and use that path as the public URL root (e.g. `/uploads/<filename>`).

Example `.env.product` entries

# store uploads under project public/uploads (default)
# UPLOADS_DIR=public/uploads

# store uploads at host root /uploads (recommended for your setup)
UPLOADS_DIR=/uploads

Docker Compose

The repository's `docker-compose.yml` has been updated to mount two paths:
- `./public/uploads:/app/public/uploads` (backwards compatibility)
- `./uploads:/uploads` (host-level uploads directory)

This means when `UPLOADS_DIR=/uploads`, files written inside container `/uploads` will persist to host `./uploads` (project root).

Notes

- If you deploy to a cloud environment with multiple instances or autoscaling, prefer using an external object storage (S3/Azure Blob/GCS) instead of local filesystem.
- Make sure the process has permission to write to the target directory on the host.
- You may want to add backups for `./uploads` or mount a Docker named volume.
