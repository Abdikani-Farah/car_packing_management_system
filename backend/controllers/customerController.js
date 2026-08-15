import Customer from '../models/Customer.js';

// GET /api/customers
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find()
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('vehicle');
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

// POST /api/customers
export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address, vehicle } = req.body;

    if (!name || !phone) {
      res.status(400);
      throw new Error('Name and phone number are required');
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      vehicle: vehicle || null,
    });

    const populated = await Customer.findById(customer._id).populate('vehicle');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    customer.name = req.body.name ? req.body.name.trim() : customer.name;
    customer.phone = req.body.phone ? req.body.phone.trim() : customer.phone;
    customer.email = req.body.email !== undefined ? req.body.email.trim() : customer.email;
    customer.address = req.body.address !== undefined ? req.body.address.trim() : customer.address;
    if (req.body.vehicle !== undefined) {
      customer.vehicle = req.body.vehicle || null;
    }

    const updatedCustomer = await customer.save();
    const populated = await Customer.findById(updatedCustomer._id).populate('vehicle');
    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    await customer.deleteOne();
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
