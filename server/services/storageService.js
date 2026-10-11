const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Cloudflare R2 speaks the S3 API. Each client project gets its own folder
// (key prefix) named after the project inside the headquarter bucket.
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET || "methynix-headquarter";

let client = null;
const getClient = () => {
  if (client) return client;
  if (!ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error("Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.");
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return client;
};

exports.isConfigured = () =>
  Boolean(ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

// "Mwananchi Retail App!" -> "mwananchi-retail-app"
exports.slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";

const safeName = (name = "file") => name.replace(/[^\w.\-]+/g, "_").slice(0, 120);

exports.upload = async ({ folder, filename, body, contentType }) => {
  const key = `${folder}/${Date.now()}-${safeName(filename)}`;
  await getClient().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType || "application/octet-stream" })
  );
  return key;
};

// R2 has no real folders; a zero-byte marker makes the folder show up in the
// Cloudflare dashboard as soon as the project exists.
exports.createFolder = async (folder) => {
  await getClient().send(new PutObjectCommand({ Bucket: BUCKET, Key: `${folder}/.keep`, Body: "" }));
};

exports.signedUrl = (key, filename) =>
  getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: filename ? `inline; filename="${safeName(filename)}"` : undefined,
    }),
    { expiresIn: 60 * 10 }
  );

exports.remove = async (key) => {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};
