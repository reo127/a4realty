import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
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

// GET all properties
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const properties = await Property.find().sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, count: properties.length, data: properties },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

// POST create a new property
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Verify token and get user
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Add user ID to property data
    data.user = decoded.id;
    
    // Create property
    const property = await Property.create(data);
    
    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}