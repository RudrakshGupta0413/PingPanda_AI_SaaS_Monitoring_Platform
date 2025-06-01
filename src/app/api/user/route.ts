import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id")

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
  }

  const cacheKey = `user:${userId}`
  await redis.del(`user:${userId}`)
  const cachedUser = await redis.get(cacheKey)

  if (cachedUser) {
    return NextResponse.json({ source: "cache", data: cachedUser })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        quotaLimit: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await redis.set(cacheKey, user, { ex: 3600 }) // Cache for 1 hour

    return NextResponse.json({ source: "db", data: user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
