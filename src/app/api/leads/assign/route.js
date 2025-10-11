import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

// POST - Assign leads to an agent
export async function POST(request) {
  try {
    await connectToDatabase();

    const data = await request.json();
    const { leadIds, agentId, assignedBy } = data;

    // Validate required fields
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Lead IDs array is required' },
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

    // Update leads
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
        message: `Successfully assigned ${result.modifiedCount} leads to ${agent.name}`,
        data: {
          assignedCount: result.modifiedCount,
          agentName: agent.name,
          agentId: agent._id
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign leads error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
