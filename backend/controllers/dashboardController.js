import ParkingSpace from '../models/ParkingSpace.js';
import Vehicle from '../models/Vehicle.js';
import ParkingSession from '../models/ParkingSession.js';
import Payment from '../models/Payment.js';

// GET /api/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalSpaces = await ParkingSpace.countDocuments();
    const availableSpaces = await ParkingSpace.countDocuments({ status: 'Available' });
    const occupiedSpaces = await ParkingSpace.countDocuments({ status: 'Occupied' });
    const reservedSpaces = await ParkingSpace.countDocuments({ status: 'Reserved' });
    const maintenanceSpaces = await ParkingSpace.countDocuments({ status: 'Maintenance' });

    const totalVehicles = await Vehicle.countDocuments();

    // Today's boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayEntries = await ParkingSession.countDocuments({
      entryTime: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayExits = await ParkingSession.countDocuments({
      exitTime: { $gte: startOfToday, $lte: endOfToday },
      status: 'Completed',
    });

    const todayPayments = await Payment.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: 'Paid',
    });

    const todayRevenue = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Fetch current parked vehicles (active sessions)
    const activeSessions = await ParkingSession.find({ status: 'Active' })
      .populate('vehicle')
      .populate('parkingSpace')
      .sort({ entryTime: -1 })
      .limit(10);

    // Fetch recent completed sessions
    const recentSessions = await ParkingSession.find({ status: 'Completed' })
      .populate('vehicle')
      .populate('parkingSpace')
      .sort({ exitTime: -1 })
      .limit(5);

    res.status(200).json({
      totalSpaces,
      availableSpaces,
      occupiedSpaces,
      reservedSpaces,
      maintenanceSpaces,
      totalVehicles,
      todayEntries,
      todayExits,
      todayRevenue,
      activeSessions,
      recentSessions,
    });
  } catch (error) {
    next(error);
  }
};
