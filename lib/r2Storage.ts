import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = "6b4065c0d5afc93bff6850e10bab4ee2";
const ACCESS_KEY_ID = "7aa1504e68a65bf69df4c5990fbe6fea";
const SECRET_ACCESS_KEY = "3f5ff710d49a03c18aab3983b719c8c8a321216e6fabc32b772b9372272f3179";
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "academic-agent-studio";

export const s3R2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToR2(fileName: string, fileBuffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3R2Client.send(command);
  return `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${fileName}`;
}

export async function getSignedFileUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  const url = await getSignedUrl(s3R2Client, command, { expiresIn: 3600 });
  return url;
}
