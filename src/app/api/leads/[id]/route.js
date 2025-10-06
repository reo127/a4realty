import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';

// GET - Get a single lead by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const lead = await Lead.findById(params.id);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: lead },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get lead by ID error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead by ID
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const lead = await Lead.findByIdAndDelete(params.id);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Lead deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
