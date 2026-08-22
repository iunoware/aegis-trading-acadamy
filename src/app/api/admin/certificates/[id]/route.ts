// import { mkdir, unlink, writeFile } from "node:fs/promises";
// import path from "node:path";
// import { NextResponse } from "next/server";

// import { prisma } from "@/lib/prisma";
// import { getRequiredSuperAdmin } from "@/lib/current-user";

// interface CertificateRouteContext {
//   params: Promise<{
//     id: string;
//   }>;
// }

// const CERTIFICATE_UPLOAD_DIRECTORY = path.join(
//   process.cwd(),
//   "public",
//   "uploads",
//   "certificates",
// );

// const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 5 MB

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

// // PATCH /api/certificates/[id]
// export async function PATCH(request: Request, context: CertificateRouteContext) {
//   let newImageUrl: string | null = null;

//   try {
//     await getRequiredSuperAdmin();

//     const { id } = await context.params;

//     const existingCertificate = await prisma.showcaseCertificate.findUnique({
//       where: {
//         id,
//       },
//     });

//     if (!existingCertificate) {
//       return NextResponse.json(
//         {
//           message: "Certificate not found",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

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

//     const hasNewImage = imageValue instanceof File && imageValue.size > 0;

//     if (hasNewImage) {
//       if (!ALLOWED_IMAGE_TYPES.includes(imageValue.type)) {
//         return NextResponse.json(
//           {
//             message: "Only JPG, PNG, WebP and AVIF images are allowed",
//           },
//           {
//             status: 400,
//           },
//         );
//       }

//       if (imageValue.size > MAX_IMAGE_SIZE) {
//         return NextResponse.json(
//           {
//             message: "Certificate image must be smaller than 5 MB",
//           },
//           {
//             status: 400,
//           },
//         );
//       }

//       const fileName = createSafeFileName(imageValue);
//       const absoluteFilePath = path.join(CERTIFICATE_UPLOAD_DIRECTORY, fileName);

//       await mkdir(CERTIFICATE_UPLOAD_DIRECTORY, {
//         recursive: true,
//       });

//       const imageBuffer = Buffer.from(await imageValue.arrayBuffer());

//       await writeFile(absoluteFilePath, imageBuffer);

//       newImageUrl = `/uploads/certificates/${fileName}`;
//     }

//     const updatedCertificate = await prisma.showcaseCertificate.update({
//       where: {
//         id,
//       },
//       data: {
//         title,
//         displayOrder:
//           Number.isInteger(displayOrder) && displayOrder >= 0
//             ? displayOrder
//             : existingCertificate.displayOrder,
//         status,
//         publishedAt:
//           status === "PUBLISHED" ? existingCertificate.publishedAt || new Date() : null,
//         imageUrl: newImageUrl || existingCertificate.imageUrl,
//       },
//     });

//     // The database update succeeded, so the previous image can be removed.
//     if (newImageUrl && existingCertificate.imageUrl !== newImageUrl) {
//       try {
//         await deleteUploadedImage(existingCertificate.imageUrl);
//       } catch (imageDeleteError) {
//         console.error(
//           "Certificate updated, but old image removal failed:",
//           imageDeleteError,
//         );
//       }
//     }

//     return NextResponse.json(formatCertificate(updatedCertificate));
//   } catch (error) {
//     console.error("Failed to update certificate:", error);

//     // Remove the newly uploaded image if the database update fails.
//     if (newImageUrl) {
//       try {
//         await deleteUploadedImage(newImageUrl);
//       } catch (imageDeleteError) {
//         console.error("Failed to clean up new certificate image:", imageDeleteError);
//       }
//     }

//     return NextResponse.json(
//       {
//         message: "Failed to update certificate",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// // DELETE /api/certificates/[id]
// export async function DELETE(_request: Request, context: CertificateRouteContext) {
//   try {
//     await getRequiredSuperAdmin();

//     const { id } = await context.params;

//     const certificate = await prisma.showcaseCertificate.findUnique({
//       where: {
//         id,
//       },
//     });

//     if (!certificate) {
//       return NextResponse.json(
//         {
//           message: "Certificate not found",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     // Permanent database deletion.
//     await prisma.showcaseCertificate.delete({
//       where: {
//         id,
//       },
//     });

//     // Delete the corresponding local image.
//     try {
//       await deleteUploadedImage(certificate.imageUrl);
//     } catch (imageDeleteError) {
//       console.error("Certificate deleted, but image removal failed:", imageDeleteError);

//       return NextResponse.json(
//         {
//           message: "Certificate deleted, but its image could not be removed",
//         },
//         {
//           status: 200,
//         },
//       );
//     }

//     return NextResponse.json({
//       message: "Certificate deleted successfully",
//     });
//   } catch (error) {
//     console.error("Failed to delete certificate:", error);

//     return NextResponse.json(
//       {
//         message: "Failed to delete certificate",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { saveCertificateImage, deleteCertificateImage } from "@/lib/certificate-storage";

interface CertificateRouteContext {
  params: Promise<{ id: string }>;
}

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

// PATCH /api/certificates/[id]
export async function PATCH(request: Request, context: CertificateRouteContext) {
  let newImageUrl: string | null = null;

  try {
    await getRequiredSuperAdmin();

    const { id } = await context.params;

    const existingCertificate = await prisma.showcaseCertificate.findUnique({
      where: { id },
    });

    if (!existingCertificate) {
      return NextResponse.json({ message: "Certificate not found" }, { status: 404 });
    }

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

    const hasNewImage = imageValue instanceof File && imageValue.size > 0;

    if (hasNewImage) {
      newImageUrl = await saveCertificateImage(imageValue as File);
    }

    const updatedCertificate = await prisma.showcaseCertificate.update({
      where: { id },
      data: {
        title,
        displayOrder:
          Number.isInteger(displayOrder) && displayOrder >= 0
            ? displayOrder
            : existingCertificate.displayOrder,
        status,
        publishedAt:
          status === "PUBLISHED" ? existingCertificate.publishedAt || new Date() : null,
        imageUrl: newImageUrl || existingCertificate.imageUrl,
      },
    });

    // The database update succeeded, so the previous image can be removed.
    if (newImageUrl && existingCertificate.imageUrl !== newImageUrl) {
      await deleteCertificateImage(existingCertificate.imageUrl).catch((cleanupError) =>
        console.error("Certificate updated, but old image removal failed:", cleanupError),
      );
    }

    return NextResponse.json(formatCertificate(updatedCertificate));
  } catch (error) {
    console.error("Failed to update certificate:", error);

    if (newImageUrl) {
      await deleteCertificateImage(newImageUrl).catch((cleanupError) =>
        console.error("Failed to clean up new certificate image:", cleanupError),
      );
    }

    const message =
      error instanceof Error &&
      (error.message.includes("Only JPG") || error.message.includes("smaller than"))
        ? error.message
        : "Failed to update certificate";
    const status = message === "Failed to update certificate" ? 500 : 400;

    return NextResponse.json({ message }, { status });
  }
}

// DELETE /api/certificates/[id]
export async function DELETE(_request: Request, context: CertificateRouteContext) {
  try {
    await getRequiredSuperAdmin();

    const { id } = await context.params;

    const certificate = await prisma.showcaseCertificate.findUnique({ where: { id } });

    if (!certificate) {
      return NextResponse.json({ message: "Certificate not found" }, { status: 404 });
    }

    await prisma.showcaseCertificate.delete({ where: { id } });

    await deleteCertificateImage(certificate.imageUrl).catch((cleanupError) => {
      console.error("Certificate deleted, but image removal failed:", cleanupError);
    });

    return NextResponse.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Failed to delete certificate:", error);

    return NextResponse.json(
      { message: "Failed to delete certificate" },
      { status: 500 },
    );
  }
}
