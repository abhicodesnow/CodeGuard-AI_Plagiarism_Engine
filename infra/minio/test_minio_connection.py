# Save as: infra/minio/test_minio_connection.py
# Run from host (not inside Docker): python infra/minio/test_minio_connection.py
# Requires: pip install minio

from minio import Minio
from minio.error import S3Error
import io

client = Minio(
    "localhost:9000",
    access_key="codeguard",
    secret_key="codeguard-secret-change-in-prod",
    secure=False,
)

# Upload a test object
test_data = b"Hello from Codeguard test"
client.put_object(
    bucket_name="codeguard-submissions",
    object_name="test/hello.txt",
    data=io.BytesIO(test_data),
    length=len(test_data),
    content_type="text/plain",
)
print("✓ Upload succeeded")

# Download and verify
response = client.get_object("codeguard-submissions", "test/hello.txt")
assert response.read() == test_data
print("✓ Download and verify succeeded")

# Clean up
client.remove_object("codeguard-submissions", "test/hello.txt")
print("✓ Cleanup done")
print("\nMinIO is fully operational for Dev B.")
