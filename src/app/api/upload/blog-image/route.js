import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Helper function to verify admin token
async function verifyAdminToken(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return { isValid: false, error: 'Admin access required' };
    }

    return { isValid: true, userId: decoded.id };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
}

// POST - Upload blog image (admin only)
export async function POST(request) {
  try {
    // Verify admin token
    const tokenVerification = await verifyAdminToken(request);
    if (!tokenVerification.isValid) {
      return NextResponse.json(
        { success: false, message: tokenVerification.error },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueId = uuidv4();
    const fileName = `blog-${Date.now()}-${uniqueId}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blog-images');
    
    try {
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // Return the public URL
    const imageUrl = `/uploads/blog-images/${fileName}`;
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        fileName,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}