import { NextRequest, NextResponse } from 'next/server'
import { db, uptimeChecks } from '@/db'
import { eq, desc, gte, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const componentId = searchParams.get('componentId')
    const days = parseInt(searchParams.get('days') || '90')
    
    const conditions = [
      gte(uptimeChecks.timestamp, new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    ]
    
    if (componentId) {
      conditions.push(eq(uptimeChecks.componentId, componentId))
    }
    
    const checks = await db.query.uptimeChecks.findMany({
      where: and(...conditions),
      orderBy: [desc(uptimeChecks.timestamp)],
      with: {
        component: true
      }
    })
    
    // Calculate uptime percentage
    const uptimeByComponent: Record<string, { total: number; up: number; percentage: number }> = {}
    
    checks.forEach(check => {
      if (!uptimeByComponent[check.componentId]) {
        uptimeByComponent[check.componentId] = { total: 0, up: 0, percentage: 0 }
      }
      
      uptimeByComponent[check.componentId].total++
      if (check.status === 'up') {
        uptimeByComponent[check.componentId].up++
      }
    })
    
    Object.keys(uptimeByComponent).forEach(componentId => {
      const data = uptimeByComponent[componentId]
      data.percentage = (data.up / data.total) * 100
    })
    
    return NextResponse.json({
      checks,
      summary: uptimeByComponent
    })
  } catch (error) {
    console.error('Failed to fetch uptime data:', error)
    return NextResponse.json({ error: 'Failed to fetch uptime data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const [uptimeCheck] = await db.insert(uptimeChecks).values({
      componentId: body.componentId,
      status: body.status,
      responseTime: body.responseTime
    }).returning()
    
    return NextResponse.json(uptimeCheck, { status: 201 })
  } catch (error) {
    console.error('Failed to create uptime check:', error)
    return NextResponse.json({ error: 'Failed to create uptime check' }, { status: 500 })
  }
}