// In-memory fallback store when MongoDB is not connected

const createInitialState = () => {
  const pricing = {
    _id: 'pricing-1',
    hourlyRate: 5,
    dailyRate: 35,
    monthlyRate: 250,
    overtimeRate: 10,
    currency: 'USD',
  };

  const customers = [
    {
      _id: 'cust-1',
      name: 'Amina Mohamed',
      email: 'amina@example.com',
      phone: '+252 61 555 0101',
      membershipType: 'vip',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'cust-2',
      name: 'Hassan Ali',
      email: 'hassan@example.com',
      phone: '+252 61 555 0202',
      membershipType: 'regular',
      createdAt: new Date().toISOString(),
    },
  ];

  const vehicles = [
    {
      _id: 'veh-1',
      plateNumber: 'SL-7892-A',
      model: 'Toyota Land Cruiser',
      color: 'White',
      type: 'suv',
      customerId: customers[0],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'veh-2',
      plateNumber: 'SL-3410-B',
      model: 'Honda Civic',
      color: 'Silver',
      type: 'sedan',
      customerId: customers[1],
      createdAt: new Date().toISOString(),
    },
  ];

  const spaces = [];
  const zones = ['A', 'B', 'C', 'D'];
  let idCounter = 1;

  zones.forEach((zone) => {
    for (let i = 1; i <= 6; i++) {
      const spaceNumber = `${zone}-${i.toString().padStart(2, '0')}`;
      let type = 'standard';
      if (i === 1) type = 'handicapped';
      else if (i === 2) type = 'ev';
      else if (i === 3) type = 'compact';
      else if (i === 6) type = 'vip';

      let status = 'available';
      if (spaceNumber === 'A-01' || spaceNumber === 'B-02') {
        status = 'occupied';
      } else if (spaceNumber === 'C-04') {
        status = 'reserved';
      } else if (spaceNumber === 'D-05') {
        status = 'maintenance';
      }

      spaces.push({
        _id: `sp-${idCounter++}`,
        spaceNumber,
        zone,
        floor: 1,
        type,
        status,
        hourlyRate: type === 'vip' ? 10 : type === 'ev' ? 7 : 5,
        createdAt: new Date().toISOString(),
      });
    }
  });

  const space1 = spaces.find((s) => s.spaceNumber === 'A-01');
  const space2 = spaces.find((s) => s.spaceNumber === 'B-02');

  const sessions = [
    {
      _id: 'sess-1',
      ticketNumber: 'TKT-1001',
      spaceId: space1,
      vehicleId: vehicles[0],
      customerId: customers[0],
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sess-2',
      ticketNumber: 'TKT-1002',
      spaceId: space2,
      vehicleId: vehicles[1],
      customerId: customers[1],
      entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  const payments = [
    {
      _id: 'pay-1',
      ticketNumber: 'TKT-0999',
      amount: 15,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'pay-2',
      ticketNumber: 'TKT-0998',
      amount: 25,
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  const users = [
    {
      _id: 'usr-admin',
      name: 'John Doe',
      email: 'admin@parkmaster.com',
      password: 'admin123',
      role: 'admin',
      title: 'Head Administrator',
      phone: '+252 61 500 0001',
      status: 'active',
      avatar: 'AD',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr-manager',
      name: 'Sarah Connor',
      email: 'manager@parkmaster.com',
      password: 'manager123',
      role: 'manager',
      title: 'Operations Manager',
      phone: '+252 61 500 0002',
      status: 'active',
      avatar: 'SC',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr-attendant',
      name: 'Mike Ross',
      email: 'attendant@parkmaster.com',
      password: 'attendant123',
      role: 'attendant',
      title: 'Gate Attendant',
      phone: '+252 61 500 0003',
      status: 'active',
      avatar: 'MR',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr-customer',
      name: 'Amina Mohamed',
      email: 'customer@parkmaster.com',
      password: 'customer123',
      role: 'customer',
      title: 'VIP Member / Driver',
      phone: '+252 61 555 0101',
      status: 'active',
      avatar: 'AM',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users,
    pricing,
    customers,
    vehicles,
    spaces,
    sessions,
    payments,
  };
};

export const memoryStore = createInitialState();
