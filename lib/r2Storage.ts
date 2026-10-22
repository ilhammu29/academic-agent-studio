import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "academic-agent-studio";

export function isR2Configured(): boolean {
  return !!(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY);
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadFileToR2(fileName: string, fileBuffer: Buffer, contentType: string) {
  const client = getR2Client();
  if (!client) {
    throw new Error("Cloudflare R2 belum dikonfigurasi di environment server (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await client.send(command);
  return `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${fileName}`;
}

export async function getSignedFileUrl(fileName: string) {
  const client = getR2Client();
  if (!client) {
    throw new Error("Cloudflare R2 belum dikonfigurasi.");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
}
