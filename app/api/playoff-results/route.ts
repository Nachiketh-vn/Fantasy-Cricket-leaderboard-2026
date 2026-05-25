import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const FILE_PATH = join(process.cwd(), 'lib', 'playoffResults.json')

function readStore(): Record<string, Record<string, number | string>> {
  try {
    return JSON.parse(readFileSync(FILE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeStore(data: Record<string, Record<string, number | string>>) {
  writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

export async function GET() {
  return NextResponse.json(readStore())
}

export async function POST(req: Request) {
  const body = await req.json() as { playoffName: string; result: Record<string, number | string> }
  const store = readStore()
  store[body.playoffName] = body.result
  writeStore(store)
  return NextResponse.json(store)
}
