import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

// POST - Bulk assign random leads to an agent
export async function POST(request) {
  try {
    await connectToDatabase();

    const data = await request.json();
    const { count, agentId, assignedBy, status, location } = data;

    // Validate required fields
    if (!count || count <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid count is required' },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify agent exists and has role 'agent'
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return NextResponse.json(
        { success: false, message: 'Invalid agent ID or agent not found' },
        { status: 404 }
      );
    }

    // Build filter query for unassigned leads
    const filter = {
      isAssigned: false
    };

    // Apply optional filters
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (location) {
      filter.interestedLocation = { $regex: location, $options: 'i' };
    }

    // Get random unassigned leads
    const leads = await Lead.find(filter).limit(count);

    if (leads.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No unassigned leads found matching the criteria' },
        { status: 404 }
      );
    }

    const leadIds = leads.map(lead => lead._id);

    // Assign leads to agent
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: {
          assignedTo: agentId,
          assignedBy: assignedBy || null,
          assignedAt: new Date(),
          isAssigned: true
        }
      }
    );

    // Update agent's assigned leads count
    const newAssignedCount = await Lead.countDocuments({
      assignedTo: agentId,
      isAssigned: true
    });

    await User.findByIdAndUpdate(agentId, {
      assignedLeadsCount: newAssignedCount
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully assigned ${result.modifiedCount} random leads to ${agent.name}`,
        data: {
          requestedCount: count,
          assignedCount: result.modifiedCount,
          agentName: agent.name,
          agentId: agent._id
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk assign leads error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
