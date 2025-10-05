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

// GET - Get all leads (admin only) with pagination and filtering
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 30;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filter query
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { interestedLocation: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch leads with pagination
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        count: leads.length,
        totalCount,
        totalPages,
        currentPage: page,
        data: leads
      },
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
    const { leadId, action, status, substatus, note, siteVisitDate, followUpDate, visitReason, rescheduleReason, followUpNotes } = data;

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
    if (!lead.visitHistory) {
      lead.visitHistory = [];
    }
    if (!lead.followUpHistory) {
      lead.followUpHistory = [];
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

      // Handle site_visit_scheduled status
      if (status === 'site_visit_scheduled' && siteVisitDate && visitReason) {
        lead.siteVisitDate = new Date(siteVisitDate);
        lead.visitHistory.push({
          type: 'scheduled',
          scheduledDate: new Date(siteVisitDate),
          reason: visitReason,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle follow_up_scheduled status
      if (status === 'follow_up_scheduled' && followUpDate && followUpNotes) {
        lead.followUpDate = new Date(followUpDate);
        lead.followUpHistory.push({
          scheduledDate: new Date(followUpDate),
          notes: followUpNotes,
          completed: false,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle visit_rescheduled status
      if (status === 'visit_rescheduled' && siteVisitDate && rescheduleReason) {
        lead.siteVisitDate = new Date(siteVisitDate);
        lead.visitHistory.push({
          type: 'rescheduled',
          scheduledDate: new Date(siteVisitDate),
          reason: visitReason || '',
          rescheduleReason: rescheduleReason,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle site_visit_done status
      if (status === 'site_visit_done') {
        lead.visitHistory.push({
          type: 'completed',
          scheduledDate: lead.siteVisitDate || new Date(),
          reason: 'Site visit completed',
          addedAt: new Date(),
          addedBy: 'admin'
        });
        // Mark the last follow-up as completed if exists
        if (lead.followUpHistory.length > 0) {
          lead.followUpHistory[lead.followUpHistory.length - 1].completed = true;
        }
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

      // Handle site_visit_scheduled status
      if (status === 'site_visit_scheduled' && siteVisitDate && visitReason) {
        lead.siteVisitDate = new Date(siteVisitDate);
        lead.visitHistory.push({
          type: 'scheduled',
          scheduledDate: new Date(siteVisitDate),
          reason: visitReason,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle follow_up_scheduled status
      if (status === 'follow_up_scheduled' && followUpDate && followUpNotes) {
        lead.followUpDate = new Date(followUpDate);
        lead.followUpHistory.push({
          scheduledDate: new Date(followUpDate),
          notes: followUpNotes,
          completed: false,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle visit_rescheduled status
      if (status === 'visit_rescheduled' && siteVisitDate && rescheduleReason) {
        lead.siteVisitDate = new Date(siteVisitDate);
        lead.visitHistory.push({
          type: 'rescheduled',
          scheduledDate: new Date(siteVisitDate),
          reason: visitReason || '',
          rescheduleReason: rescheduleReason,
          addedAt: new Date(),
          addedBy: 'admin'
        });
      }

      // Handle site_visit_done status
      if (status === 'site_visit_done') {
        lead.visitHistory.push({
          type: 'completed',
          scheduledDate: lead.siteVisitDate || new Date(),
          reason: 'Site visit completed',
          addedAt: new Date(),
          addedBy: 'admin'
        });
        // Mark the last follow-up as completed if exists
        if (lead.followUpHistory.length > 0) {
          lead.followUpHistory[lead.followUpHistory.length - 1].completed = true;
        }
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