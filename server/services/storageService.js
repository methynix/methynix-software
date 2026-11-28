const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Cloudflare R2 speaks the S3 API. Each client project gets its own folder
// (key prefix) named after the project inside the headquarter bucket.
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET || "methynix-headquarter";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev";

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

exports.publicUrl = (key) => {
  const base = PUBLIC_URL.replace(/\/+$/, "");
  const encodedKey = String(key || "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${base}/${encodedKey}`;
};

exports.remove = async (key) => {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

// Metadata for an object that is already in the bucket (null when missing).
exports.head = async (key) => {
  try {
    const r = await getClient().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return { size: r.ContentLength || 0, contentType: r.ContentType || "" };
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404 || err.name === "NotFound") return null;
    throw err;
  }
};

// Objects under a prefix, so files uploaded straight to R2 can be linked to a
// project without uploading them again.
exports.list = async (prefix = "") => {
  const r = await getClient().send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, MaxKeys: 500 }));
  return (r.Contents || [])
    .filter((o) => o.Key && !o.Key.endsWith("/") && !o.Key.endsWith(".keep"))
    .map((o) => ({ key: o.Key, size: o.Size || 0, modified: o.LastModified }));
};

exports.getBuffer = async (key) => {
  const r = await getClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await r.Body.transformToByteArray());
};

// The personal gallery lives in its own private bucket (no public URL), so
// nothing in it is ever reachable except through short-lived signed links.
const GALLERY_BUCKET = process.env.R2_GALLERY_BUCKET || "company-data";

exports.gallery = {
  upload: async ({ filename, body, contentType }) => {
    const key = `gallery/${Date.now()}-${safeName(filename)}`;
    await getClient().send(
      new PutObjectCommand({ Bucket: GALLERY_BUCKET, Key: key, Body: body, ContentType: contentType || "application/octet-stream" })
    );
    return key;
  },
  signedUrl: (key, filename, download = false) =>
    getSignedUrl(
      getClient(),
      new GetObjectCommand({
        Bucket: GALLERY_BUCKET,
        Key: key,
        ResponseContentDisposition: filename ? `${download ? "attachment" : "inline"}; filename="${safeName(filename)}"` : undefined,
      }),
      { expiresIn: 60 * 60 }
    ),
  remove: (key) => getClient().send(new DeleteObjectCommand({ Bucket: GALLERY_BUCKET, Key: key })),
  head: async (key) => {
    try {
      const r = await getClient().send(new HeadObjectCommand({ Bucket: GALLERY_BUCKET, Key: key }));
      return { size: r.ContentLength || 0, contentType: r.ContentType || "" };
    } catch (err) {
      if (err.$metadata?.httpStatusCode === 404 || err.name === "NotFound") return null;
      throw err;
    }
  },
  list: async () => {
    const r = await getClient().send(new ListObjectsV2Command({ Bucket: GALLERY_BUCKET, MaxKeys: 1000 }));
    return (r.Contents || [])
      .filter((o) => o.Key && !o.Key.endsWith("/") && !o.Key.endsWith(".keep"))
      .map((o) => ({ key: o.Key, size: o.Size || 0, modified: o.LastModified }));
  },
};
