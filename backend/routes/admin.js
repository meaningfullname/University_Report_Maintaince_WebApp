const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin/technician role
router.use(protect);
router.use(authorize('admin', 'technician'));

// @route   GET /api/admin/reports
// @desc    Get all reports with advanced filtering (admin/technician)
// @access  Private/Admin/Technician
router.get('/reports', async (req, res) => {
  try {
    const { status, urgency, category, search, limit, page } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (urgency && urgency !== 'all') filter.urgency = urgency;
    if (category && category !== 'all') filter.category = category;
    
    if (search) {
      filter.$or = [
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    
    const reports = await Report.find(filter)
      .populate('user', 'name email studentId phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Report.countDocuments(filter);
    
    res.json({
      success: true,
      count: reports.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: reports,
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/reports/:id/status
// @desc    Update report status
// @access  Private/Admin/Technician
router.put('/reports/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    report.status = status;
    await report.save();
    
    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/reports/:id/assign
// @desc    Assign report to technician
// @access  Private/Admin
router.put('/reports/:id/assign', authorize('admin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    report.assignedTo = assignedTo;
    if (assignedTo && report.status === 'pending') {
      report.status = 'in-progress';
    }
    
    await report.save();
    
    res.json({
      success: true,
      message: 'Report assigned successfully',
      data: report,
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/reports/:id
// @desc    Update report details
// @access  Private/Admin/Technician
router.put('/reports/:id', async (req, res) => {
  try {
    const { status, urgency, assignedTo, estimatedCompletion } = req.body;
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    
    if (status) report.status = status;
    if (urgency) report.urgency = urgency;
    if (assignedTo !== undefined) report.assignedTo = assignedTo;
    if (estimatedCompletion) report.estimatedCompletion = estimatedCompletion;
    
    await report.save();
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/reports/:id
// @desc    Delete report (admin only)
// @access  Private/Admin
router.delete('/reports/:id', authorize('admin'), async (req, res) => {
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
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get detailed statistics
// @access  Private/Admin
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const total = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: 'pending' });
    const inProgress = await Report.countDocuments({ status: 'in-progress' });
    const completed = await Report.countDocuments({ status: 'completed' });
    
    const highPriority = await Report.countDocuments({ urgency: 'high' });
    const mediumPriority = await Report.countDocuments({ urgency: 'medium' });
    const lowPriority = await Report.countDocuments({ urgency: 'low' });
    
    // By category
    const byCategory = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Recent reports
    const recentReports = await Report.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const studentCount = await User.countDocuments({ role: 'student' });
    const technicianCount = await User.countDocuments({ role: 'technician' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    res.json({
      success: true,
      data: {
        reports: {
          total,
          byStatus: { pending, inProgress, completed },
          byUrgency: { high: highPriority, medium: mediumPriority, low: lowPriority },
          byCategory: byCategory.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: {
            student: studentCount,
            technician: technicianCount,
            admin: adminCount,
          },
        },
        recentReports,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/technicians
// @desc    Get all technicians
// @access  Private/Admin
router.get('/technicians', authorize('admin'), async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician', isActive: true }).select('name email phone');
    
    res.json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;

