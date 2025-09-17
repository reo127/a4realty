import mongoose from 'mongoose';

// Define status and substatus options
const STATUS_SUBSTATUS_MAP = {
  'new': [], // New status has no substatus
  'not_connected': [
    'ringing',
    'switched_off',
    'call_busy',
    'call_disconnected',
    'invalid_number'
  ],
  'interested': [
    'site_visit_scheduled_with_date',
    'site_visit_scheduled_no_date',
    'follow_up'
  ],
  'not_interested': [
    'not_actively_searching',
    'require_more_than_6_months',
    'not_the_right_party'
  ],
  'call_disconnected': [
    'hang_up_while_talking',
    'call_drop'
  ],
  'location_mismatch': [
    'looking_for_other_location',
    'looking_for_other_city'
  ],
  'budget_mismatch': [
    'budget_is_low',
    'budget_is_high'
  ],
  'possession_mismatch': [
    'looking_for_ready_to_move',
    'looking_for_under_construction'
  ],
  'do_not_disturb': [
    'already_in_touch_with_builder',
    'deal_closed',
    'plan_drop',
    'plan_postponed',
    'already_purchased',
    'dnc'
  ],
  'site_visit_done': [
    'deal_closed',
    'follow_up',
    'interested_in_revisit',
    'plan_cancelled'
  ]
};

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
  updatedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    enum: Object.keys(STATUS_SUBSTATUS_MAP),
    default: 'new'
  },
  substatus: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // If substatus is provided, it must be valid for the current status
        if (v && this.status) {
          const validSubstatuses = STATUS_SUBSTATUS_MAP[this.status] || [];
          return validSubstatuses.includes(v);
        }
        return true; // null/undefined is valid
      },
      message: function(props) {
        return `Invalid substatus "${props.value}" for status "${this.status}"`;
      }
    }
  },
  siteVisitDate: {
    type: Date,
    default: null // Only set when substatus is site_visit_scheduled_with_date
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
    },
    relatedToStatusChange: {
      type: Boolean,
      default: false
    },
    previousStatus: {
      type: String,
      default: null
    },
    previousSubstatus: {
      type: String,
      default: null
    }
  }]
});

// Middleware to update the updatedAt field on save
LeadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to validate substatus when status changes
LeadSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const validSubstatuses = STATUS_SUBSTATUS_MAP[this.status] || [];

    // If new status doesn't support substatus, clear it
    if (validSubstatuses.length === 0) {
      this.substatus = null;
    }
    // If current substatus is not valid for new status, clear it
    else if (this.substatus && !validSubstatuses.includes(this.substatus)) {
      this.substatus = null;
    }
  }
  next();
});

// Static method to get valid substatus options for a status
LeadSchema.statics.getValidSubstatuses = function(status) {
  return STATUS_SUBSTATUS_MAP[status] || [];
};

// Static method to get status-substatus mapping
LeadSchema.statics.getStatusSubstatusMap = function() {
  return STATUS_SUBSTATUS_MAP;
};

// Instance method to get display names
LeadSchema.methods.getStatusDisplay = function() {
  const statusDisplayNames = {
    'new': 'New',
    'not_connected': 'Not Connected',
    'interested': 'Interested',
    'not_interested': 'Not Interested',
    'call_disconnected': 'Call Disconnected',
    'location_mismatch': 'Location Mismatch',
    'budget_mismatch': 'Budget Mismatch',
    'possession_mismatch': 'Possession Mismatch',
    'do_not_disturb': 'Do Not Disturb',
    'site_visit_done': 'Site Visit Done'
  };
  return statusDisplayNames[this.status] || this.status;
};

LeadSchema.methods.getSubstatusDisplay = function() {
  if (!this.substatus) return null;

  const substatusDisplayNames = {
    // Not Connected
    'ringing': 'Ringing',
    'switched_off': 'Switched Off',
    'call_busy': 'Call Busy',
    'call_disconnected': 'Call Disconnected',
    'invalid_number': 'Invalid Number',

    // Interested
    'site_visit_scheduled_with_date': 'Site Visit Scheduled (With Date)',
    'site_visit_scheduled_no_date': 'Site Visit Scheduled (No Date)',
    'follow_up': 'Follow Up',

    // Not Interested
    'not_actively_searching': 'Not Actively Searching',
    'require_more_than_6_months': 'Require More Than 6 Months',
    'not_the_right_party': 'Not The Right Party',

    // Call Disconnected
    'hang_up_while_talking': 'Hang Up While Talking',
    'call_drop': 'Call Drop',

    // Location Mismatch
    'looking_for_other_location': 'Looking For Other Location',
    'looking_for_other_city': 'Looking For Other City',

    // Budget Mismatch
    'budget_is_low': 'Budget Is Low',
    'budget_is_high': 'Budget Is High',

    // Possession Mismatch
    'looking_for_ready_to_move': 'Looking For Ready To Move',
    'looking_for_under_construction': 'Looking For Under Construction',

    // Do Not Disturb
    'already_in_touch_with_builder': 'Already In Touch With Builder',
    'deal_closed': 'Deal Closed',
    'plan_drop': 'Plan Drop',
    'plan_postponed': 'Plan Postponed',
    'already_purchased': 'Already Purchased',
    'dnc': 'DNC',

    // Site Visit Done
    'interested_in_revisit': 'Interested In Re-visit',
    'plan_cancelled': 'Plan Cancelled'
  };

  return substatusDisplayNames[this.substatus] || this.substatus;
};

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export default Lead;