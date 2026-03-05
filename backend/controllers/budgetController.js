const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Get budgets for current month
// @route   GET /api/budget
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ 
      user: req.user._id,
      month,
      year
    });

    // Calculate spent amount for each category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'Debit',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Group spending by category
    const spendingByCategory = {};
    transactions.forEach(txn => {
      const cat = txn.category;
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + txn.amount;
    });

    // Update spent amounts
    const updatedBudgets = budgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      return {
        ...budget.toObject(),
        spentAmount: spent,
        remaining: budget.budgetAmount - spent,
        percentage: Math.round((spent / budget.budgetAmount) * 100)
      };
    });

    res.json({ success: true, data: updatedBudgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update budget
// @route   POST /api/budget
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, budgetAmount } = req.body;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check if budget exists for this category/month
    let budget = await Budget.findOne({
      user: req.user._id,
      category,
      month,
      year
    });

    if (budget) {
      // Update existing budget
      budget.budgetAmount = budgetAmount;
      await budget.save();
    } else {
      // Create new budget
      budget = await Budget.create({
        user: req.user._id,
        category,
        budgetAmount,
        month,
        year
      });
    }

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budget/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await budget.deleteOne();

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get spending analytics
// @route   GET /api/budget/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get transactions
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate analytics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryWise = {};
    const dailySpending = {};

    transactions.forEach(txn => {
      if (txn.type === 'Credit') {
        totalIncome += txn.amount;
      } else {
        totalExpense += txn.amount;
        
        // Category wise
        categoryWise[txn.category] = (categoryWise[txn.category] || 0) + txn.amount;
        
        // Daily spending
        const dateKey = txn.date.toISOString().split('T')[0];
        dailySpending[dateKey] = (dailySpending[dateKey] || 0) + txn.amount;
      }
    });

    // Top spending categories
    const topCategories = Object.entries(categoryWise)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / totalExpense) * 100) || 0
      }));

    res.json({ 
      success: true, 
      data: {
        totalIncome,
        totalExpense,
        savings: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
        topCategories,
        dailySpending,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  deleteBudget,
  getAnalytics
};