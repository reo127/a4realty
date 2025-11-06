import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

// POST - Unassign all leads from a specific agent
export async function POST(request) {
  try {
    await connectToDatabase();

    const data = await request.json();
    const { agentId } = data;

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      );
    }

    // Count leads before unassigning
    const leadsCount = await Lead.countDocuments({
      assignedTo: agentId,
      isAssigned: true
    });

    if (leadsCount === 0) {
      return NextResponse.json(
        { success: false, message: `No leads assigned to ${agent.name}` },
        { status: 404 }
      );
    }

    // Unassign all leads from this agent
    const result = await Lead.updateMany(
      { assignedTo: agentId },
      {
        $set: {
          isAssigned: false
        },
        $unset: {
          assignedTo: "",
          assignedBy: "",
          assignedAt: ""
        }
      }
    );

    // Update agent's assigned leads count
    await User.findByIdAndUpdate(agentId, {
      assignedLeadsCount: 0
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully unassigned ${result.modifiedCount} leads from ${agent.name}`,
        data: {
          agentName: agent.name,
          agentId: agent._id,
          unassignedCount: result.modifiedCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unassign all leads error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
