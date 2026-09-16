import { prisma } from '@/lib/db/prisma'
import { PLAN_LIMITS } from './constants'

export interface UsageCheckResult {
  allowed: boolean
  used: number
  limit: number
  plan: string
}

function getCurrentBillingPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function checkAndConsumeCredit(userId: string): Promise<UsageCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  })
  const plan = subscription?.plan ?? 'FREE'
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE
  const billingPeriod = getCurrentBillingPeriod()

  const usage = await prisma.usageTracking.upsert({
    where: { userId_billingPeriod: { userId, billingPeriod } },
    create: { userId, billingPeriod, count: 0 },
    update: {},
  })

  if (plan === 'PRO' || usage.count < limit) {
    await prisma.usageTracking.update({
      where: { userId_billingPeriod: { userId, billingPeriod } },
      data: { count: { increment: 1 } },
    })
    return { allowed: true, used: usage.count + 1, limit, plan }
  }

  return { allowed: false, used: usage.count, limit, plan }
}

export async function getUsage(userId: string): Promise<UsageCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  })
  const plan = subscription?.plan ?? 'FREE'
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE
  const billingPeriod = getCurrentBillingPeriod()

  const usage = await prisma.usageTracking.findUnique({
    where: { userId_billingPeriod: { userId, billingPeriod } },
  })

  return {
    allowed: (usage?.count ?? 0) < limit || plan === 'PRO',
    used: usage?.count ?? 0,
    limit,
    plan,
  }
}
