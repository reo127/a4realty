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
  interestedLocation: {
    type: String,
    required: [true, 'Please provide interested location'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'interested', 'not_interested', 'follow_up', 'closed'],
    default: 'new'
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: String,
      default: 'admin'
    }
  }]
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// POST - Create a new lead
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone || !data.interestedLocation) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, and interested location are required' },
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

// PUT - Update lead status or add notes
export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    const { leadId, action, status, note } = data;
    
    if (!leadId || !action) {
      return NextResponse.json(
        { success: false, message: 'Lead ID and action are required' },
        { status: 400 }
      );
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    // Initialize fields if they don't exist (for existing leads)
    if (!lead.notes) {
      lead.notes = [];
    }
    if (!lead.status) {
      lead.status = 'new';
    }

    if (action === 'updateStatus') {
      if (!status) {
        return NextResponse.json(
          { success: false, message: 'Status is required for status update' },
          { status: 400 }
        );
      }
      lead.status = status;
    } else if (action === 'addNote') {
      if (!note) {
        return NextResponse.json(
          { success: false, message: 'Note content is required' },
          { status: 400 }
        );
      }
      lead.notes.push({
        content: note,
        addedAt: new Date(),
        addedBy: 'admin'
      });
    } else if (action === 'updateStatusAndNote') {
      if (!status) {
        return NextResponse.json(
          { success: false, message: 'Status is required for status update' },
          { status: 400 }
        );
      }
      lead.status = status;
      if (note) {
        lead.notes.push({
          content: note,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    const savedLead = await lead.save();
    
    return NextResponse.json(
      { success: true, data: savedLead, message: 'Lead updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}