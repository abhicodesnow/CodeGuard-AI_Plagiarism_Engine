#!/usr/bin/env sh
# infra/minio/init-buckets.sh
#
# Creates MinIO buckets and lifecycle policies.
# Run context: inside codeguard-minio-init container, after MinIO is healthy.
#
# Uses the `mc` (MinIO Client) CLI — already in the minio/mc Docker image.

set -eu

ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
ACCESS_KEY="${MINIO_ACCESS_KEY:-codeguard}"
SECRET_KEY="${MINIO_SECRET_KEY:-codeguard-secret-change-in-prod}"
ALIAS="codeguard-local"

echo "══════════════════════════════════════════════════════"
echo "Codeguard MinIO Bucket Initialization"
echo "Endpoint: ${ENDPOINT}"
echo "══════════════════════════════════════════════════════"

# ── Configure mc alias ──────────────────────────────────────────────────────
echo ""
echo "→ Configuring mc alias..."
mc alias set "${ALIAS}" "${ENDPOINT}" "${ACCESS_KEY}" "${SECRET_KEY}" --api S3v4
echo "  ✓ Alias configured"

# ── Helper: create bucket if it doesn't exist ────────────────────────────────
create_bucket() {
  local BUCKET="$1"
  echo ""
  echo "→ Creating bucket: ${ALIAS}/${BUCKET}"

  if mc ls "${ALIAS}/${BUCKET}" &>/dev/null; then
    echo "  ⊙ Already exists — skipping"
  else
    mc mb "${ALIAS}/${BUCKET}"
    echo "  ✓ Created"
  fi
}

# ── codeguard-submissions ────────────────────────────────────────────────────────
# Stores: raw ZIP files uploaded by instructors
# Path pattern: submissions/{jobId}.zip
# Lifecycle: expire after 30 days (ZIPs are large; results are what matter)
create_bucket "codeguard-submissions"

cat > /tmp/submissions-lifecycle.json << 'LIFECYCLE_EOF'
{
  "Rules": [
    {
      "ID": "expire-raw-submissions",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "submissions/"
      },
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
LIFECYCLE_EOF

mc ilm import "${ALIAS}/codeguard-submissions" < /tmp/submissions-lifecycle.json
echo "  ✓ Lifecycle policy applied (30-day expiry on submissions/)"

# ── codeguard-reports ────────────────────────────────────────────────────────
# Stores: LLM forensic JSON reports + extracted C++ source files
# Path patterns:
#   reports/{jobId}/{pairId}.json   ← LLM forensic report
#   extracted/{jobId}/{filename}    ← Individual C++ files (for AI worker retrieval)
#
# Lifecycle:
#   reports/ → 90 days (audit record; instructors need these for grade disputes)
#   extracted/ → 7 days (temp files; only needed during active analysis)
create_bucket "codeguard-reports"

cat > /tmp/reports-lifecycle.json << 'LIFECYCLE_EOF'
{
  "Rules": [
    {
      "ID": "expire-extracted-sources",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "extracted/"
      },
      "Expiration": {
        "Days": 7
      }
    },
    {
      "ID": "expire-forensic-reports",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "reports/"
      },
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
LIFECYCLE_EOF

mc ilm import "${ALIAS}/codeguard-reports" < /tmp/reports-lifecycle.json
echo "  ✓ Lifecycle policy applied (7-day expiry on extracted/, 90-day on reports/)"

# ── Verification ─────────────────────────────────────────────────────────────
echo ""
echo "── Verification ───────────────────────────────────────"
echo "Buckets:"
mc ls "${ALIAS}"

echo ""
echo "codeguard-submissions lifecycle:"
mc ilm ls "${ALIAS}/codeguard-submissions"

echo ""
echo "codeguard-reports lifecycle:"
mc ilm ls "${ALIAS}/codeguard-reports"

echo ""
echo "══════════════════════════════════════════════════════"
echo "✓ All Codeguard MinIO buckets initialized successfully"
echo "   Console: http://localhost:9001"
echo "   User: ${ACCESS_KEY}"
echo "══════════════════════════════════════════════════════"
