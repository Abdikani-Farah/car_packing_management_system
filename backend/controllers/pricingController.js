import Pricing from '../models/Pricing.js';

// GET /api/pricing
export const getPricing = async (req, res, next) => {
  try {
    let pricingList = await Pricing.find().sort({ vehicleType: 1 });

    // Seed default pricing if none exists
    if (pricingList.length === 0) {
      const defaultRates = [
        { vehicleType: 'Car', hourlyRate: 2 },
        { vehicleType: 'Motorcycle', hourlyRate: 1 },
        { vehicleType: 'Van', hourlyRate: 3 },
        { vehicleType: 'Truck', hourlyRate: 5 },
      ];
      pricingList = await Pricing.insertMany(defaultRates);
    }

    res.status(200).json(pricingList);
  } catch (error) {
    next(error);
  }
};

// PUT /api/pricing/:id
export const updatePricing = async (req, res, next) => {
  try {
    const { hourlyRate } = req.body;

    if (hourlyRate === undefined || hourlyRate < 0) {
      res.status(400);
      throw new Error('Valid non-negative hourly rate is required');
    }

    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
      res.status(404);
      throw new Error('Pricing rule not found');
    }

    pricing.hourlyRate = Number(hourlyRate);
    const updatedPricing = await pricing.save();

    res.status(200).json(updatedPricing);
  } catch (error) {
    next(error);
  }
};
