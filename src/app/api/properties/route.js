import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import jwt from 'jsonwebtoken';

// Helper function to verify token (same as working upload API)
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

// GET all properties with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const mode = searchParams.get('mode');
    const type = searchParams.get('type');
    const bhk = searchParams.get('bhk');
    const price = searchParams.get('price');
    
    // Build filter object
    const filter = {};
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' }; // Case-insensitive search
    }
    
    if (mode) {
      filter.mode = mode;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (bhk) {
      filter.bhk = bhk;
    }
    
    if (price) {
      filter.price = { $lte: parseInt(price) };
    }
    
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    
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
    
    // Verify token (same as working upload API)
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin (role is in the JWT token)
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
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