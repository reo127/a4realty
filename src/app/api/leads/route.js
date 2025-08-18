import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Lead Schema
const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length === 10 && /^\d+$/.test(v);
      },
      message: 'Please provide a 10-digit phone number'
    }
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  }
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// POST - Create a new lead
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Check if lead already exists with the same phone
    const existingLead = await Lead.findOne({ phone: data.phone });
    if (existingLead) {
      return NextResponse.json(
        { success: true, data: existingLead, message: 'Lead already exists' },
        { status: 200 }
      );
    }

    // Create new lead
    const lead = await Lead.create(data);
    
    return NextResponse.json(
      { success: true, data: lead, message: 'Lead created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

// GET - Get all leads (admin only)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, count: leads.length, data: leads },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}