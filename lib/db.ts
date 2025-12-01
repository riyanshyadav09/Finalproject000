// Mock database for demo
export const prisma = {
  user: {
    findUnique: () => null,
    findFirst: () => null,
    create: () => null,
  },
  video: {
    findMany: () => [],
    findFirst: () => null,
    create: () => null,
    update: () => null,
    count: () => 0,
  }
}