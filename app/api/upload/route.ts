import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { existsSync } from 'fs'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const formData = await req.formData()
        const files: { url: string }[] = []

        // We will store uploads inside the public/uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        
        if (!existsSync(uploadDir)) {
             await mkdir(uploadDir, { recursive: true })
        }

        for (const [key, value] of formData.entries()) {
            // Check if the value is a File Object from FormData
            if (value && typeof value === 'object' && 'arrayBuffer' in value) {
                const file = value as File
                const buffer = Buffer.from(await file.arrayBuffer())
                // Create a unique safe filename
                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
                const filePath = path.join(uploadDir, fileName)
                
                await writeFile(filePath, buffer)
                // Returning the public URL path
                files.push({ url: `/uploads/${fileName}` })
            }
        }

        return NextResponse.json({ success: true, files })
    } catch (e) {
        console.error('Upload Error:', e)
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
    }
}
