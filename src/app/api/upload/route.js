import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to verify token
const verifyToken = (request) => {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function POST(request) {
  try {
    // Verify token
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    const data = await request.formData();
    const file = data.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', new Blob([buffer]));
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const cloudinaryData = await cloudinaryResponse.json();
    
    if (!cloudinaryResponse.ok) {
      throw new Error(cloudinaryData.error?.message || 'Failed to upload to Cloudinary');
    }
    
    return NextResponse.json(
      { 
        success: true, 
        url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}