import { defineEventHandler, readMultipartFormData } from 'h3'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event)
    
    if (!files || files.length === 0) {
      throw new Error('No file uploaded')
    }

    const file = files[0]
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // Ensure the uploads directory exists
    await mkdir(uploadDir, { recursive: true })
    
    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.filename}`
    const filepath = join(uploadDir, filename)
    
    // Write the file
    await writeFile(filepath, file.data)
    
    return {
      success: true,
      filename,
      path: `/uploads/${filename}`
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Upload failed'
    })
  }
}) 