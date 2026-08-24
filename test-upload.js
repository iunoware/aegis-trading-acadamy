// // test-upload.js — run with: node test-upload.js
// const { S3Client } = require("@aws-sdk/client-s3");
// const { Upload } = require("@aws-sdk/lib-storage");
// const fs = require("fs");

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// async function run() {
//   const filePath = process.argv[2]; // pass path to your 32MB test video
//   const buffer = fs.readFileSync(filePath);

//   console.log("Starting upload, size:", buffer.length, "bytes");
//   const start = Date.now();

//   const upload = new Upload({
//     client: s3Client,
//     params: {
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: `test-uploads/${Date.now()}.mp4`,
//       Body: buffer,
//       ContentType: "video/mp4",
//     },
//     queueSize: 4,
//     partSize: 10 * 1024 * 1024,
//   });

//   upload.on("httpUploadProgress", (p) => {
//     console.log("progress:", p.loaded, "/", p.total);
//   });

//   await upload.done();
//   console.log("Done in", (Date.now() - start) / 1000, "seconds");
// }

// run().catch(console.error);
