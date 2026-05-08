import io
import segno
from miniopy_async import Minio
from app.core.config import settings


minio_client = Minio(
    settings.MINIO_ENDPOINT,
    settings.MINIO_ACCESS_KEY,
    settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)


async def ensure_bucket():
    exists = await minio_client.bucket_exists(settings.MINIO_BUCKET)
    if not exists:
        await minio_client.make_bucket(settings.MINIO_BUCKET)

    policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::' + settings.MINIO_BUCKET + '/*"}]}'
    await minio_client.set_bucket_policy(settings.MINIO_BUCKET, policy)


async def generate_and_save_qr(shortcode: str) -> str:
    url = f"{settings.BASE_URL}/{shortcode}"

    qr = segno.make(url, error="H")
    buffer = io.BytesIO()
    qr.save(buffer, kind="png", scale=10)
    buffer.seek(0)
    size = buffer.getbuffer().nbytes

    object_name = f"qr/{shortcode}.png"
    await minio_client.put_object(
        settings.MINIO_BUCKET,
        object_name,
        buffer,
        size,
        content_type="image/png"
    )

    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{object_name}"

