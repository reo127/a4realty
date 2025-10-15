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

// GET a single property by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Check if ID is valid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }
    
    const property = await Property.findById(id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: property },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

// PUT update a property by ID
export async function PUT(request, { params }) {
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

    const { id } = await params;

    // Check if ID is valid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Clean data - remove empty strings for enum fields and other optional fields
    const cleanData = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      // Skip empty strings, null, and undefined values
      if (value !== '' && value !== null && value !== undefined) {
        // For arrays, keep them even if empty
        if (Array.isArray(value)) {
          cleanData[key] = value;
        } else {
          cleanData[key] = value;
        }
      }
    });

    // Find property
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Check authorization: admin can update any property, builders can only update their own
    if (decoded.role !== 'admin' && property.user.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own properties' },
        { status: 403 }
      );
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      cleanData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(
      { success: true, data: updatedProperty },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

// DELETE a property by ID
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Check if ID is valid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }

    // Find property
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Check authorization: admin can delete any property, builders can only delete their own
    if (decoded.role !== 'admin' && property.user.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own properties' },
        { status: 403 }
      );
    }

    // Delete property
    await Property.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Property deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}