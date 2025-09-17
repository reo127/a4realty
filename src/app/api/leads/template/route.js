import { NextResponse } from 'next/server';

// GET - Download CSV template for bulk lead upload
export async function GET(request) {
  try {
    // CSV template headers and sample data
    const csvTemplate = `name,phonenumber,location,email
John Doe,9876543210,Koramangala,john.doe@example.com
Jane Smith,9876543211,BTM Layout,jane.smith@example.com
Sample Lead,9876543212,Electronic City,sample@example.com`;

    // Create response with CSV content
    const response = new NextResponse(csvTemplate);

    // Set headers for file download
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename="lead_upload_template.csv"');

    return response;
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}