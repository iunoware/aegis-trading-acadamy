// import { mkdir, unlink, writeFile } from "node:fs/promises";
// import path from "node:path";
// import { NextResponse } from "next/server";
// import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { prisma } from "@/lib/prisma";

// const CERTIFICATE_UPLOAD_DIRECTORY = path.join(
//   process.cwd(),
//   "public",
//   "uploads",
//   "certificates",
// );

// const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// function formatCertificate(certificate: {
//   id: string;
//   title: string;
//   imageUrl: string;
//   status: "DRAFT" | "PUBLISHED" | "HIDDEN";
//   displayOrder: number;
//   createdAt: Date;
//   updatedAt: Date;
// }) {
//   return {
//     ...certificate,
//     status:
//       certificate.status === "PUBLISHED" ? ("Published" as const) : ("Hidden" as const),
//     createdAt: certificate.createdAt.toISOString(),
//     updatedAt: certificate.updatedAt.toISOString(),
//   };
// }

// function getFileExtension(file: File) {
//   const extensionFromName = path.extname(file.name).toLowerCase();

//   if (extensionFromName) {
//     return extensionFromName;
//   }

//   const extensions: Record<string, string> = {
//     "image/jpeg": ".jpg",
//     "image/png": ".png",
//     "image/webp": ".webp",
//     "image/avif": ".avif",
//   };

//   return extensions[file.type] || "";
// }

// function createSafeFileName(file: File) {
//   const extension = getFileExtension(file);

//   return `certificate-${Date.now()}-${crypto.randomUUID()}${extension}`;
// }

// async function deleteUploadedImage(imageUrl: string) {
//   if (!imageUrl.startsWith("/uploads/certificates/")) {
//     return;
//   }

//   const relativePath = imageUrl.replace(/^\/+/, "");
//   const absolutePath = path.join(process.cwd(), "public", relativePath);

//   try {
//     await unlink(absolutePath);
//   } catch (error) {
//     const fileError = error as NodeJS.ErrnoException;

//     if (fileError.code !== "ENOENT") {
//       throw error;
//     }
//   }
// }

// // GET /api/certificates
// export async function GET() {
//   try {
//     const certificates = await prisma.showcaseCertificate.findMany({
//       orderBy: [
//         {
//           displayOrder: "asc",
//         },
//         {
//           createdAt: "desc",
//         },
//       ],
//     });

//     const formattedCertificates = certificates.map(formatCertificate);

//     return NextResponse.json(formattedCertificates);
//   } catch (error) {
//     console.error("Failed to fetch certificates:", error);

//     return NextResponse.json(
//       {
//         message: "Failed to fetch certificates",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// // POST /api/certificates
// export async function POST(request: Request) {
//   let uploadedImageUrl: string | null = null;

//   try {
//     await getRequiredSuperAdmin();

//     const formData = await request.formData();

//     const titleValue = formData.get("title");
//     const statusValue = formData.get("status");
//     const displayOrderValue = formData.get("displayOrder");
//     const imageValue = formData.get("image");

//     const title = typeof titleValue === "string" ? titleValue.trim() : "";

//     const status = statusValue === "Hidden" ? "HIDDEN" : "PUBLISHED";

//     const displayOrder = Number(displayOrderValue);

//     if (!title) {
//       return NextResponse.json(
//         {
//           message: "Certificate title is required",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!(imageValue instanceof File) || imageValue.size === 0) {
//       return NextResponse.json(
//         {
//           message: "Certificate image is required",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!ALLOWED_IMAGE_TYPES.includes(imageValue.type)) {
//       return NextResponse.json(
//         {
//           message: "Only JPG, PNG, WebP and AVIF images are allowed",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (imageValue.size > MAX_IMAGE_SIZE) {
//       return NextResponse.json(
//         {
//           message: "Certificate image must be smaller than 5 MB",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const fileName = createSafeFileName(imageValue);
//     const absoluteFilePath = path.join(CERTIFICATE_UPLOAD_DIRECTORY, fileName);

//     await mkdir(CERTIFICATE_UPLOAD_DIRECTORY, {
//       recursive: true,
//     });

//     const imageBuffer = Buffer.from(await imageValue.arrayBuffer());

//     await writeFile(absoluteFilePath, imageBuffer);

//     uploadedImageUrl = `/uploads/certificates/${fileName}`;

//     const certificate = await prisma.showcaseCertificate.create({
//       data: {
//         title,
//         imageUrl: uploadedImageUrl,
//         displayOrder:
//           Number.isInteger(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
//         status,
//         publishedAt: status === "PUBLISHED" ? new Date() : null,
//       },
//     });

//     return NextResponse.json(formatCertificate(certificate), {
//       status: 201,
//     });
//   } catch (error) {
//     console.error("Failed to create certificate:", error);

//     // Remove the image if the database creation fails.
//     if (uploadedImageUrl) {
//       try {
//         await deleteUploadedImage(uploadedImageUrl);
//       } catch (imageDeleteError) {
//         console.error("Failed to clean up uploaded certificate image:", imageDeleteError);
//       }
//     }

//     return NextResponse.json(
//       {
//         message: "Failed to create certificate",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { saveCertificateImage, deleteCertificateImage } from "@/lib/certificate-storage";

function formatCertificate(certificate: {
  id: string;
  title: string;
  imageUrl: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...certificate,
    status:
      certificate.status === "PUBLISHED" ? ("Published" as const) : ("Hidden" as const),
    createdAt: certificate.createdAt.toISOString(),
    updatedAt: certificate.updatedAt.toISOString(),
  };
}

// GET /api/certificates
export async function GET() {
  try {
    const certificates = await prisma.showcaseCertificate.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(certificates.map(formatCertificate));
  } catch (error) {
    console.error("Failed to fetch certificates:", error);

    return NextResponse.json(
      { message: "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}

// POST /api/certificates
export async function POST(request: Request) {
  let uploadedImageUrl: string | null = null;

  try {
    await getRequiredSuperAdmin();

    const formData = await request.formData();

    const titleValue = formData.get("title");
    const statusValue = formData.get("status");
    const displayOrderValue = formData.get("displayOrder");
    const imageValue = formData.get("image");

    const title = typeof titleValue === "string" ? titleValue.trim() : "";
    const status = statusValue === "Hidden" ? "HIDDEN" : "PUBLISHED";
    const displayOrder = Number(displayOrderValue);

    if (!title) {
      return NextResponse.json(
        { message: "Certificate title is required" },
        { status: 400 },
      );
    }

    if (!(imageValue instanceof File) || imageValue.size === 0) {
      return NextResponse.json(
        { message: "Certificate image is required" },
        { status: 400 },
      );
    }

    uploadedImageUrl = await saveCertificateImage(imageValue);

    const certificate = await prisma.showcaseCertificate.create({
      data: {
        title,
        imageUrl: uploadedImageUrl,
        displayOrder:
          Number.isInteger(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(formatCertificate(certificate), { status: 201 });
  } catch (error) {
    console.error("Failed to create certificate:", error);

    if (uploadedImageUrl) {
      await deleteCertificateImage(uploadedImageUrl).catch((cleanupError) =>
        console.error("Failed to clean up uploaded certificate image:", cleanupError),
      );
    }

    const message =
      error instanceof Error &&
      (error.message.includes("Only JPG") || error.message.includes("smaller than"))
        ? error.message
        : "Failed to create certificate";
    const status = message === "Failed to create certificate" ? 500 : 400;

    return NextResponse.json({ message }, { status });
  }
}
