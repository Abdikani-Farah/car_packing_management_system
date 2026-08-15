import Pricing from './models/Pricing.js';
import ParkingSpace from './models/ParkingSpace.js';
import Vehicle from './models/Vehicle.js';
import Customer from './models/Customer.js';
import ParkingSession from './models/ParkingSession.js';
import Payment from './models/Payment.js';
import User from './models/User.js';

export const seedDatabase = async () => {
  try {
    // Seed default users if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        {
          name: 'John Doe',
          email: 'admin@parkmaster.com',
          password: 'admin123',
          role: 'admin',
          phone: '+252 61 500 0001',
          status: 'active',
        },
        {
          name: 'Sarah Connor',
          email: 'manager@parkmaster.com',
          password: 'manager123',
          role: 'manager',
          phone: '+252 61 500 0002',
          status: 'active',
        },
        {
          name: 'Mike Ross',
          email: 'attendant@parkmaster.com',
          password: 'attendant123',
          role: 'attendant',
          phone: '+252 61 500 0003',
          status: 'active',
        },
        {
          name: 'Amina Mohamed',
          email: 'customer@parkmaster.com',
          password: 'customer123',
          role: 'customer',
          phone: '+252 61 555 0101',
          status: 'active',
        },
      ]);
      console.log('Default role-based users seeded successfully.');
    }

    const spaceCount = await ParkingSpace.countDocuments();
    if (spaceCount > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Seeding initial data into database...');

    // 1. Seed Pricing
    const defaultPricing = [
      { vehicleType: 'Car', hourlyRate: 2 },
      { vehicleType: 'Motorcycle', hourlyRate: 1 },
      { vehicleType: 'Van', hourlyRate: 3 },
      { vehicleType: 'Truck', hourlyRate: 5 },
    ];
    await Pricing.insertMany(defaultPricing);

    // 2. Seed Parking Spaces
    const spacesData = [
      { spaceNumber: 'P-001', floor: 'Floor 1', type: 'Car', status: 'Available' },
      { spaceNumber: 'P-002', floor: 'Floor 1', type: 'Car', status: 'Occupied' },
      { spaceNumber: 'P-003', floor: 'Floor 1', type: 'Motorcycle', status: 'Available' },
      { spaceNumber: 'P-004', floor: 'Floor 1', type: 'VIP', status: 'Available' },
      { spaceNumber: 'P-005', floor: 'Floor 1', type: 'Disabled', status: 'Reserved' },
      { spaceNumber: 'P-006', floor: 'Floor 2', type: 'Car', status: 'Maintenance' },
      { spaceNumber: 'P-007', floor: 'Floor 2', type: 'Car', status: 'Occupied' },
      { spaceNumber: 'P-008', floor: 'Floor 2', type: 'Van', status: 'Available' },
      { spaceNumber: 'P-009', floor: 'Floor 2', type: 'Truck', status: 'Available' },
      { spaceNumber: 'P-010', floor: 'Floor 2', type: 'Car', status: 'Available' },
      { spaceNumber: 'P-011', floor: 'Floor 3', type: 'VIP', status: 'Available' },
      { spaceNumber: 'P-012', floor: 'Floor 3', type: 'Car', status: 'Available' },
    ];
    const createdSpaces = await ParkingSpace.insertMany(spacesData);

    // 3. Seed Vehicles
    const vehiclesData = [
      { plateNumber: 'KAB-1024', type: 'Car', model: 'Toyota Camry', color: 'Silver', ownerName: 'Alice Johnson', ownerPhone: '+1-555-0101' },
      { plateNumber: 'KCD-9988', type: 'Car', model: 'Honda Civic', color: 'Blue', ownerName: 'Bob Smith', ownerPhone: '+1-555-0102' },
      { plateNumber: 'MC-8821', type: 'Motorcycle', model: 'Yamaha MT-07', color: 'Black', ownerName: 'Charlie Brown', ownerPhone: '+1-555-0103' },
      { plateNumber: 'VAN-7700', type: 'Van', model: 'Ford Transit', color: 'White', ownerName: 'Delta Express', ownerPhone: '+1-555-0104' },
      { plateNumber: 'TRK-5520', type: 'Truck', model: 'Volvo FH16', color: 'Red', ownerName: 'Evan Cargo', ownerPhone: '+1-555-0105' },
    ];
    const createdVehicles = await Vehicle.insertMany(vehiclesData);

    // 4. Seed Customers
    const customersData = [
      { name: 'Alice Johnson', phone: '+1-555-0101', email: 'alice@example.com', address: '123 Pine St, Cityville', vehicle: createdVehicles[0]._id },
      { name: 'Bob Smith', phone: '+1-555-0102', email: 'bob@example.com', address: '456 Oak Ave, Townsville', vehicle: createdVehicles[1]._id },
      { name: 'Charlie Brown', phone: '+1-555-0103', email: 'charlie@example.com', address: '789 Elm Rd, Metro', vehicle: createdVehicles[2]._id },
    ];
    const createdCustomers = await Customer.insertMany(customersData);

    // 5. Assign occupied spaces to active sessions
    const p002 = createdSpaces.find((s) => s.spaceNumber === 'P-002');
    const p007 = createdSpaces.find((s) => s.spaceNumber === 'P-007');

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    // Session 1: Active
    const session1 = await ParkingSession.create({
      vehicle: createdVehicles[0]._id,
      customer: createdCustomers[0]._id,
      parkingSpace: p002._id,
      entryTime: twoHoursAgo,
      status: 'Active',
    });
    p002.currentVehicle = createdVehicles[0]._id;
    await p002.save();

    // Session 2: Active
    const session2 = await ParkingSession.create({
      vehicle: createdVehicles[1]._id,
      customer: createdCustomers[1]._id,
      parkingSpace: p007._id,
      entryTime: fourHoursAgo,
      status: 'Active',
    });
    p007.currentVehicle = createdVehicles[1]._id;
    await p007.save();

    // Session 3: Completed (History & Payment)
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const p001 = createdSpaces.find((s) => s.spaceNumber === 'P-001');

    const completedSession = await ParkingSession.create({
      vehicle: createdVehicles[2]._id,
      customer: createdCustomers[2]._id,
      parkingSpace: p001._id,
      entryTime: fiveHoursAgo,
      exitTime: oneHourAgo,
      duration: 4,
      amount: 4.0, // $1/hr for motorcycle x 4 hrs
      status: 'Completed',
    });

    await Payment.create({
      parkingSession: completedSession._id,
      vehicle: createdVehicles[2]._id,
      customer: createdCustomers[2]._id,
      amount: 4.0,
      paymentMethod: 'Mobile Money',
      status: 'Paid',
    });

    console.log('Database seeded successfully with initial sample records!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
