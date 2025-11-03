const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Сделаем необязательным для обратной совместимости
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
      minlength: [5, 'Location must be at least 5 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['plumbing', 'electrical', 'hvac', 'internet', 'furniture', 'other'],
    },
    urgency: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    contactInfo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    estimatedCompletion: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate estimated completion date before saving
reportSchema.pre('save', function (next) {
  if (!this.estimatedCompletion && this.isNew) {
    const daysToAdd = this.urgency === 'high' ? 1 : this.urgency === 'medium' ? 3 : 5;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    this.estimatedCompletion = estimatedDate;
  }
  next();
});

// Set completed date when status changes to completed
reportSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;

