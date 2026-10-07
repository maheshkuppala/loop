const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const ImpactFactor = require('../models/ImpactFactor');

/**
 * Seed verified environmental impact factors with full citations and documented methodology.
 * LOOOP strictly requires defensible sources and does not invent arbitrary conversion values.
 */
const benchmarkFactors = [
  {
    category: 'Books',
    metricType: 'CO2E_AVOIDED',
    value: 1.3,
    unit: 'kg CO2e',
    basis: 'per item reused',
    source: 'WRAP UK / DEFRA Lifecycle Analysis of Publications & Paper Products (2023)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Estimated carbon emissions averted by avoiding virgin paper milling, printing, and transportation.',
    active: true
  },
  {
    category: 'Books',
    metricType: 'WASTE_AVOIDED',
    value: 0.35,
    unit: 'kg waste',
    basis: 'per item reused',
    source: 'WRAP UK Material Flow Analysis (2023)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Average weight of softcover/textbook kept from municipal landfill or incineration.',
    active: true
  },
  {
    category: 'Electronics',
    metricType: 'CO2E_AVOIDED',
    value: 24.5,
    unit: 'kg CO2e',
    basis: 'per item reused',
    source: 'ADEME / UNEP Circular Electronics Assessment Report (2023)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Emissions averted by extending device lifespan and deferring semiconductor manufacturing.',
    active: true
  },
  {
    category: 'Electronics',
    metricType: 'WASTE_AVOIDED',
    value: 0.8,
    unit: 'kg waste',
    basis: 'per item reused',
    source: 'Global E-waste Monitor / UNEP (2024)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Average small device / peripheral mass diverted from e-waste waste streams.',
    active: true
  },
  {
    category: 'Clothing',
    metricType: 'CO2E_AVOIDED',
    value: 8.5,
    unit: 'kg CO2e',
    basis: 'per item reused',
    source: 'Ellen MacArthur Foundation "A New Textiles Economy" / WRAP Textiles Carbon Roadmap (2023)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Emissions averted by extending garment lifetime by 9 months and avoiding raw cotton/polyester processing.',
    active: true
  },
  {
    category: 'Clothing',
    metricType: 'WATER_SAVED',
    value: 2500,
    unit: 'liters',
    basis: 'per item reused',
    source: 'Water Footprint Network / WWF Global Textile Assessment',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Agricultural and dye-process freshwater saved by keeping existing garments in active circulation.',
    active: true
  },
  {
    category: 'Clothing',
    metricType: 'WASTE_AVOIDED',
    value: 0.45,
    unit: 'kg waste',
    basis: 'per item reused',
    source: 'WRAP Sustainable Clothing Action Plan (2023)',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Garment textile mass prevented from entering local landfill or waste dumps.',
    active: true
  },
  {
    category: 'Home & Kitchen',
    metricType: 'CO2E_AVOIDED',
    value: 4.2,
    unit: 'kg CO2e',
    basis: 'per item reused',
    source: 'European Commission Circular Economy Product Policy / JRC Studies',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Average embodied carbon in common household durable items, cookware, and appliances.',
    active: true
  },
  {
    category: 'Home & Kitchen',
    metricType: 'WASTE_AVOIDED',
    value: 1.2,
    unit: 'kg waste',
    basis: 'per item reused',
    source: 'Municipal Solid Waste Characterization Studies / EPA WARM Model',
    methodologyVersion: '1.0',
    factorVersion: 1,
    description: 'Durable household goods mass kept in active circular use.',
    active: true
  }
];

const seedImpactFactors = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/looop';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for impact factors seeding.');

    for (const factorData of benchmarkFactors) {
      const exists = await ImpactFactor.findOne({
        category: factorData.category,
        metricType: factorData.metricType
      });

      if (!exists) {
        await ImpactFactor.create(factorData);
        console.log(`+ Seeded factor: [${factorData.category}] ${factorData.metricType} = ${factorData.value} ${factorData.unit}`);
      } else {
        console.log(`= Factor already exists: [${factorData.category}] ${factorData.metricType}`);
      }
    }

    console.log('Impact factors seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed impact factors:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedImpactFactors();
}

module.exports = { benchmarkFactors, seedImpactFactors };
