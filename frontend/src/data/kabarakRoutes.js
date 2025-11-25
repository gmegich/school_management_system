// Pre-defined routes around Kabarak Primary School and surrounding areas
export const kabarakRoutes = [
  {
    name: 'Route 1 - Nakuru Road',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Nakuru Road Junction', latitude: -0.3040, longitude: 36.0810, order: 2 },
      { name: 'Molo Road Stop', latitude: -0.3050, longitude: 36.0820, order: 3 },
      { name: 'Eldama Ravine Junction', latitude: -0.3060, longitude: 36.0830, order: 4 },
    ]
  },
  {
    name: 'Route 2 - Kabarak University Road',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Kabarak University Gate', latitude: -0.3020, longitude: 36.0790, order: 2 },
      { name: 'Menengai View Estate', latitude: -0.3010, longitude: 36.0780, order: 3 },
      { name: 'Rongai Road Stop', latitude: -0.3000, longitude: 36.0770, order: 4 },
    ]
  },
  {
    name: 'Route 3 - Subukia Road',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Subukia Road Junction', latitude: -0.3045, longitude: 36.0815, order: 2 },
      { name: 'Mogotio Road Stop', latitude: -0.3060, longitude: 36.0830, order: 3 },
      { name: 'Solai Road Junction', latitude: -0.3075, longitude: 36.0845, order: 4 },
    ]
  },
  {
    name: 'Route 4 - Njoro Road',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Njoro Road Junction', latitude: -0.3025, longitude: 36.0810, order: 2 },
      { name: 'Egerton University Road', latitude: -0.3015, longitude: 36.0820, order: 3 },
      { name: 'Mau Narok Road Stop', latitude: -0.3005, longitude: 36.0830, order: 4 },
    ]
  },
  {
    name: 'Route 5 - Rongai Town',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Rongai Town Center', latitude: -0.2990, longitude: 36.0760, order: 2 },
      { name: 'Rongai Market', latitude: -0.2980, longitude: 36.0750, order: 3 },
      { name: 'Rongai Hospital Road', latitude: -0.2970, longitude: 36.0740, order: 4 },
    ]
  },
  {
    name: 'Route 6 - Nakuru Town',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Nakuru Town Center', latitude: -0.3100, longitude: 36.0900, order: 2 },
      { name: 'Nakuru CBD', latitude: -0.3110, longitude: 36.0910, order: 3 },
      { name: 'Nakuru Railway Station', latitude: -0.3120, longitude: 36.0920, order: 4 },
    ]
  },
  {
    name: 'Route 7 - Molo Road',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Molo Road Junction', latitude: -0.3045, longitude: 36.0815, order: 2 },
      { name: 'Molo Town Center', latitude: -0.3060, longitude: 36.0830, order: 3 },
      { name: 'Molo Market', latitude: -0.3075, longitude: 36.0845, order: 4 },
    ]
  },
  {
    name: 'Route 8 - Eldama Ravine',
    stops: [
      { name: 'Kabarak Primary School', latitude: -0.3031, longitude: 36.0800, order: 1 },
      { name: 'Eldama Ravine Junction', latitude: -0.3050, longitude: 36.0820, order: 2 },
      { name: 'Eldama Ravine Town', latitude: -0.3065, longitude: 36.0835, order: 3 },
      { name: 'Eldama Ravine Market', latitude: -0.3080, longitude: 36.0850, order: 4 },
    ]
  }
];

// Helper function to get route by name
export const getRouteByName = (name) => {
  return kabarakRoutes.find(route => route.name === name);
};

// Helper function to get all route names
export const getRouteNames = () => {
  return kabarakRoutes.map(route => route.name);
};

