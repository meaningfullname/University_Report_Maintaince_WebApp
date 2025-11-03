const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// @route   GET /api/reports
// @desc    Get all reports with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, urgency, search } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (urgency && urgency !== 'all') {
      filter.urgency = urgency;
    }
    
    // Search across location, description, and category
    if (search) {
      filter.$or = [
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   POST /api/reports
// @desc    Create a new report
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { location, category, urgency, description, contactInfo } = req.body;
    
    // Validation
    if (!location || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide location, category, and description',
      });
    }
    
    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters',
      });
    }
    
    const report = await Report.create({
      location,
      category,
      urgency: urgency || 'medium',
      description,
      contactInfo,
    });
    
    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { location, category, urgency, description, contactInfo, status, assignedTo } = req.body;
    
    let report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    // Update fields
    if (location) report.location = location;
    if (category) report.category = category;
    if (urgency) report.urgency = urgency;
    if (description) report.description = description;
    if (contactInfo !== undefined) report.contactInfo = contactInfo;
    if (status) report.status = status;
    if (assignedTo !== undefined) report.assignedTo = assignedTo;
    
    await report.save();
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    await report.deleteOne();
    
    res.json({
      success: true,
      message: 'Report deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/reports/stats/summary
// @desc    Get summary statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: 'pending' });
    const inProgress = await Report.countDocuments({ status: 'in-progress' });
    const completed = await Report.countDocuments({ status: 'completed' });
    
    const highPriority = await Report.countDocuments({ urgency: 'high' });
    const mediumPriority = await Report.countDocuments({ urgency: 'medium' });
    const lowPriority = await Report.countDocuments({ urgency: 'low' });
    
    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          inProgress,
          completed,
        },
        byUrgency: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;

