const express = require('express');
const router = express.Router();

const CATEGORY_DEFINITIONS = [
  {
    id: 'books',
    name: 'Books',
    description: 'Literature, novels, textbooks, exam prep, non-fiction',
    subcategories: ['Engineering', 'School', 'Competitive Exams', 'Fiction', 'Non-Fiction', 'Other']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Gadgets, peripherals, chargers, hardware accessories',
    subcategories: ['Headphones', 'Chargers', 'Keyboards', 'Computer Accessories', 'Audio & Speakers', 'Other']
  },
  {
    id: 'education',
    name: 'Study Materials',
    description: 'Notes, calculators, drafting tools, reference materials',
    subcategories: ['Scientific Calculators', 'Course Notes', 'Lab Equipment', 'Stationery Bundles', 'Drawing Boards', 'Other']
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Study tables, chairs, bookshelves, ergonomic seating',
    subcategories: ['Study Desks', 'Office Chairs', 'Bookshelves', 'Lamps & Lighting', 'Side Tables', 'Other']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Jackets, seasonal wear, formals, reusable garments',
    subcategories: ['Winter Jackets', 'Formal Attire', 'Casual Wear', 'Shoes & Footwear', 'Sportswear', 'Other']
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Fitness equipment, balls, racquets, outdoor gear',
    subcategories: ['Gym & Dumbbells', 'Badminton & Tennis', 'Football & Basketball', 'Bicycle Gear', 'Yoga & Fitness', 'Other']
  },
  {
    id: 'tools',
    name: 'Tools',
    description: 'Hand tools, DIY hardware, electrical meters, drills',
    subcategories: ['Hand Tool Sets', 'Power Drills', 'Multimeters', 'Gardening Tools', 'Hardware Kits', 'Other']
  },
  {
    id: 'home',
    name: 'Home Items',
    description: 'Kitchenware, small appliances, storage containers',
    subcategories: ['Electric Kettles', 'Cookware', 'Storage Organizers', 'Bedding & Linen', 'Tableware', 'Other']
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Backpacks, bags, travel cases, smart watches',
    subcategories: ['Backpacks & Laptop Bags', 'Watches', 'Eyewear & Cases', 'Travel Luggage', 'Other']
  },
  {
    id: 'mobility',
    name: 'Vehicles / Mobility',
    description: 'Bicycles, skateboards, roller skates, helmets',
    subcategories: ['Bicycles', 'Skateboards', 'Helmets & Locks', 'Cycle Accessories', 'Other']
  },
  {
    id: 'other',
    name: 'Other',
    description: 'General unused useful items, creative supplies',
    subcategories: ['Board Games & Hobbies', 'Art Supplies', 'Musical Instruments', 'Miscellaneous', 'Other']
  }
];

// GET /api/categories
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    count: CATEGORY_DEFINITIONS.length,
    categories: CATEGORY_DEFINITIONS
  });
});

module.exports = router;
