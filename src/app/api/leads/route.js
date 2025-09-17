import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';

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

// PUT - Update lead status, substatus, or add notes
export async function PUT(request) {
  try {
    await connectToDatabase();

    const data = await request.json();
    const { leadId, action, status, substatus, note, siteVisitDate } = data;

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

    // Store previous status and substatus for notes
    const previousStatus = lead.status;
    const previousSubstatus = lead.substatus;

    if (action === 'updateStatus' || action === 'updateStatusAndSubstatus') {
      if (!status) {
        return NextResponse.json(
          { success: false, message: 'Status is required for status update' },
          { status: 400 }
        );
      }

      // Validate substatus if provided
      if (substatus) {
        const validSubstatuses = Lead.getValidSubstatuses(status);
        if (!validSubstatuses.includes(substatus)) {
          return NextResponse.json(
            { success: false, message: `Invalid substatus "${substatus}" for status "${status}"` },
            { status: 400 }
          );
        }
      }

      lead.status = status;
      lead.substatus = substatus || null;

      // Handle site visit date for specific substatus
      if (substatus === 'site_visit_scheduled_with_date' && siteVisitDate) {
        lead.siteVisitDate = new Date(siteVisitDate);
      } else if (substatus !== 'site_visit_scheduled_with_date') {
        lead.siteVisitDate = null;
      }

      // Add automatic note for status change
      const statusChangeNote = `Status changed from "${lead.getStatusDisplay.call({status: previousStatus})}" to "${lead.getStatusDisplay()}"`;
      const substatusNote = substatus ? ` with substatus "${lead.getSubstatusDisplay()}"` : '';

      lead.notes.push({
        content: statusChangeNote + substatusNote,
        addedAt: new Date(),
        addedBy: 'admin',
        relatedToStatusChange: true,
        previousStatus,
        previousSubstatus
      });

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

    } else if (action === 'updateStatusAndNote' || action === 'updateStatusSubstatusAndNote') {
      if (!status) {
        return NextResponse.json(
          { success: false, message: 'Status is required for status update' },
          { status: 400 }
        );
      }

      // Validate substatus if provided
      if (substatus) {
        const validSubstatuses = Lead.getValidSubstatuses(status);
        if (!validSubstatuses.includes(substatus)) {
          return NextResponse.json(
            { success: false, message: `Invalid substatus "${substatus}" for status "${status}"` },
            { status: 400 }
          );
        }
      }

      lead.status = status;
      lead.substatus = substatus || null;

      // Handle site visit date
      if (substatus === 'site_visit_scheduled_with_date' && siteVisitDate) {
        lead.siteVisitDate = new Date(siteVisitDate);
      } else if (substatus !== 'site_visit_scheduled_with_date') {
        lead.siteVisitDate = null;
      }

      // Add automatic note for status change
      const statusChangeNote = `Status changed from "${previousStatus}" to "${status}"`;
      const substatusNote = substatus ? ` with substatus "${substatus}"` : '';

      lead.notes.push({
        content: statusChangeNote + substatusNote,
        addedAt: new Date(),
        addedBy: 'admin',
        relatedToStatusChange: true,
        previousStatus,
        previousSubstatus
      });

      // Add user note if provided
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

// GET - Get status and substatus options
export async function OPTIONS(request) {
  try {
    const statusSubstatusMap = Lead.getStatusSubstatusMap();

    return NextResponse.json(
      {
        success: true,
        data: {
          statusOptions: Object.keys(statusSubstatusMap),
          statusSubstatusMap
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get status options error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}