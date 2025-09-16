import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Lead Schema (reusing from main route)
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
    default: 'bulk_upload'
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

// Helper function to parse CSV data
function parseCSVData(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Validate CSV headers
  const requiredHeaders = ['name', 'phonenumber', 'location'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
  }

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Transform to match our lead schema
    const leadData = {
      name: row.name,
      phone: row.phonenumber,
      interestedLocation: row.location || '',
      source: 'bulk_upload'
    };

    // Add email if provided
    if (row.email && row.email.trim()) {
      leadData.email = row.email.trim();
    }

    data.push(leadData);
  }

  return data;
}

// Helper function to validate lead data
function validateLeadData(leadData) {
  const errors = [];

  if (!leadData.name || leadData.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!leadData.phone || leadData.phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (leadData.phone.length !== 10 || !/^\d+$/.test(leadData.phone)) {
    errors.push('Phone number must be exactly 10 digits');
  }

  if (!leadData.interestedLocation || leadData.interestedLocation.trim() === '') {
    errors.push('Location is required');
  }

  if (leadData.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(leadData.email)) {
    errors.push('Invalid email format');
  }

  return errors;
}

// POST - Bulk create leads from CSV
export async function POST(request) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('csvFile');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No CSV file provided' },
        { status: 400 }
      );
    }

    // Read CSV file content
    const csvText = await file.text();

    if (!csvText.trim()) {
      return NextResponse.json(
        { success: false, message: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Parse CSV data
    let leadDataArray;
    try {
      leadDataArray = parseCSVData(csvText);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: parseError.message },
        { status: 400 }
      );
    }

    if (leadDataArray.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid lead data found in CSV' },
        { status: 400 }
      );
    }

    // Validate all leads and collect errors
    const validationResults = [];
    const validLeads = [];

    leadDataArray.forEach((leadData, index) => {
      const errors = validateLeadData(leadData);
      const result = {
        rowNumber: index + 2, // +2 because index starts at 0 and we skip header
        leadData,
        errors,
        status: errors.length > 0 ? 'invalid' : 'valid'
      };

      validationResults.push(result);

      if (errors.length === 0) {
        validLeads.push(leadData);
      }
    });

    if (validLeads.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid leads found in CSV',
        validationResults
      }, { status: 400 });
    }

    // Check for duplicate phone numbers in the CSV itself
    const phoneNumbers = new Set();
    const duplicatesInCSV = [];

    validLeads.forEach((lead, index) => {
      if (phoneNumbers.has(lead.phone)) {
        duplicatesInCSV.push({
          phone: lead.phone,
          name: lead.name,
          rowNumber: index + 2
        });
      } else {
        phoneNumbers.add(lead.phone);
      }
    });

    // Check for existing leads in database
    const existingPhones = await Lead.find({
      phone: { $in: Array.from(phoneNumbers) }
    }).select('phone name');

    const existingPhoneSet = new Set(existingPhones.map(lead => lead.phone));

    // Filter out leads that already exist
    const newLeads = validLeads.filter(lead => !existingPhoneSet.has(lead.phone));

    // Process results
    const results = {
      totalRows: leadDataArray.length,
      validRows: validLeads.length,
      invalidRows: leadDataArray.length - validLeads.length,
      duplicatesInCSV: duplicatesInCSV.length,
      existingInDatabase: validLeads.length - newLeads.length,
      newLeadsToCreate: newLeads.length,
      validationResults,
      duplicatesInCSV,
      existingLeads: existingPhones.map(lead => ({
        phone: lead.phone,
        name: lead.name
      }))
    };

    // Create new leads in database
    let createdLeads = [];
    if (newLeads.length > 0) {
      try {
        createdLeads = await Lead.insertMany(newLeads);
        results.createdCount = createdLeads.length;
        results.createdLeads = createdLeads;
      } catch (createError) {
        console.error('Error creating leads:', createError);
        return NextResponse.json({
          success: false,
          message: 'Error creating leads in database',
          error: createError.message,
          results
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed. ${results.createdCount || 0} leads created successfully.`,
      results
    }, { status: 201 });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}