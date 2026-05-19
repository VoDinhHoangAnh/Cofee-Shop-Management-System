import { getSession } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large (max 10MB)" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original extension
    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf("."));

    // Get filename without extension
    const fileNameWithoutExt = originalName.substring(
      0,
      originalName.lastIndexOf("."),
    );

    // Create slug from original filename
    const slug = fileNameWithoutExt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create unique filename with slug and random suffix to prevent conflicts
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const uniqueName = slug
      ? `${slug}-${randomSuffix}${ext}`
      : `${randomSuffix}${ext}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public", "img");
    await mkdir(uploadDir, { recursive: true });

    // Save file to public/img folder
    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/img/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueName,
      originalName: originalName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
