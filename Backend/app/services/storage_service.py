"""
Storage Service — local filesystem and S3/object storage
"""
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException, status

from app.core.config import settings


class StorageService:
    """
    Handles file storage. Supports local filesystem or S3-compatible storage.
    Switch via STORAGE_BACKEND environment variable.
    """

    def __init__(self):
        self.backend = settings.STORAGE_BACKEND
        self.local_path = Path(settings.STORAGE_LOCAL_PATH)

    async def upload_chat_attachment(self, file: UploadFile, conversation_id: str) -> str:
        """Upload a chat attachment and return its URL."""
        self._validate_file(file)
        filename = self._generate_filename(file.filename or "file")
        path = f"chat/{conversation_id}/{filename}"
        return await self._upload(file, path)

    async def upload_plan_image(self, file: UploadFile, plan_id: str) -> str:
        """Upload a plan cover image."""
        self._validate_image(file)
        filename = self._generate_filename(file.filename or "image.jpg")
        path = f"plans/{plan_id}/{filename}"
        return await self._upload(file, path)

    async def upload_document(self, file: UploadFile, folder: str = "documents") -> str:
        """Upload a document."""
        self._validate_document(file)
        filename = self._generate_filename(file.filename or "document")
        path = f"{folder}/{filename}"
        return await self._upload(file, path)

    async def upload_profile_image(self, file: UploadFile, user_id: str) -> str:
        """Upload a profile image."""
        self._validate_image(file)
        filename = self._generate_filename(file.filename or "avatar.jpg")
        path = f"profiles/{user_id}/{filename}"
        return await self._upload(file, path)

    async def _upload(self, file: UploadFile, path: str) -> str:
        """Upload to configured backend and return URL."""
        if self.backend == "s3":
            return await self._upload_s3(file, path)
        return await self._upload_local(file, path)

    async def _upload_local(self, file: UploadFile, path: str) -> str:
        """Save file to local filesystem."""
        full_path = self.local_path / path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        contents = await file.read()
        with open(full_path, "wb") as f:
            f.write(contents)

        return f"/uploads/{path}"

    async def _upload_s3(self, file: UploadFile, path: str) -> str:
        """Upload to S3-compatible storage."""
        try:
            import boto3
            from botocore.exceptions import BotoCoreError, ClientError

            s3_client = boto3.client(
                "s3",
                endpoint_url=settings.S3_ENDPOINT,
                region_name=settings.S3_REGION,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
            )
            contents = await file.read()
            s3_client.put_object(
                Bucket=settings.S3_BUCKET,
                Key=path,
                Body=contents,
                ContentType=file.content_type or "application/octet-stream",
            )
            return f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{path}"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Storage upload failed: {str(e)}",
            )

    def _validate_file(self, file: UploadFile) -> None:
        """Basic file validation."""
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file.size and file.size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
            )

    def _validate_image(self, file: UploadFile) -> None:
        """Validate image file type."""
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Invalid image type. Allowed: {', '.join(settings.ALLOWED_IMAGE_TYPES)}",
            )

    def _validate_document(self, file: UploadFile) -> None:
        """Validate document file type."""
        if file.content_type not in settings.ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Invalid document type. Allowed: {', '.join(settings.ALLOWED_DOCUMENT_TYPES)}",
            )

    def _generate_filename(self, original_name: str) -> str:
        """Generate a unique filename preserving extension."""
        ext = Path(original_name).suffix.lower()
        return f"{uuid.uuid4().hex}{ext}"
