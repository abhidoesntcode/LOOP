import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Status } from "@prisma/client";

interface CustomUser {
  role?: string;
  workspaceId?: string;
}

// DELETE: Remove feedback entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!session || !user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const deleted = await prisma.feedback.deleteMany({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Item not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

// PATCH: Update feedback status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!session || !user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, sentiment, customerLabel } = body;

    // Build data object dynamically to allow resetting string values (e.g., empty strings)
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status as Status;
    if (sentiment !== undefined) updateData.sentiment = sentiment;
    if (customerLabel !== undefined) updateData.customerLabel = customerLabel;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const updated = await prisma.feedback.updateMany({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Item not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
