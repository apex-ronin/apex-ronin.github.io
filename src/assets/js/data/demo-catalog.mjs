// SIMULATED DATA for the Catalog Exception Desk demonstrations. Products and figures are invented.

export const queue = [
  { id: 'q1', sku: 'HX-2210', title: 'Cordless impact driver kit', type: 'price', severity: 'red', feed: '189.00', store: '139.00', impact: 1450, seen: 'Oct 29, 8:02 am', note: 'Storefront shows an expired promotion price.' },
  { id: 'q2', sku: 'LT-0451', title: 'LED shop light, 4 ft, 2-pack', type: 'availability', severity: 'red', feed: 'in stock', store: 'out of stock', impact: 920, seen: 'Oct 29, 8:02 am', note: 'Feed has 340 units on hand; product page shows sold out.' },
  { id: 'q3', sku: 'GL-7781', title: 'Nitrile work gloves, 100 ct', type: 'missing', severity: 'red', feed: 'listed', store: 'page not found', impact: 610, seen: 'Oct 29, 8:03 am', note: 'Product URL in feed returns a not-found page.' },
  { id: 'q4', sku: 'SW-1092', title: 'Shop vacuum, 12 gal', type: 'price', severity: 'caution', feed: '129.99', store: '139.99', impact: 180, seen: 'Oct 29, 8:03 am', note: 'Storefront is higher than the feed; ads may show the lower price.' },
  { id: 'q5', sku: 'TP-3300', title: 'Painter’s tape, 1.88 in, 6-pack', type: 'title', severity: 'caution', feed: 'Painter’s tape, 1.88 in, 6-pack', store: 'Painter’s tape, 1.41 in, 6-pack', impact: 95, seen: 'Oct 29, 8:04 am', note: 'Width differs between feed and storefront title.' },
  { id: 'q6', sku: 'BX-5502', title: 'Contractor trash bags, 42 gal', type: 'availability', severity: 'caution', feed: 'out of stock', store: 'in stock', impact: 260, seen: 'Oct 29, 8:04 am', note: 'Storefront takes orders the warehouse cannot fill.' },
  { id: 'q7', sku: 'DR-8840', title: 'Hammer drill, 1/2 in', type: 'unlisted', severity: 'caution', feed: 'not in feed', store: 'listed', impact: 140, seen: 'Oct 29, 8:05 am', note: 'Live on the storefront but missing from the export.' },
  { id: 'q8', sku: 'SF-1200', title: 'Safety glasses, clear, 12-pack', type: 'price', severity: 'red', feed: '24.99', store: '2.49', impact: 2100, seen: 'Oct 29, 8:05 am', note: 'Likely a decimal error on the storefront.' },
];

export const STAGES = ['New', 'Acknowledged', 'Assigned', 'Resolved'];

export const sampleFeedCSV = `sku,title,price,availability
HX-2210,Cordless impact driver kit,189.00,in stock
LT-0451,"LED shop light, 4 ft, 2-pack",54.00,in stock
GL-7781,"Nitrile work gloves, 100 ct",18.50,in stock
SW-1092,"Shop vacuum, 12 gal",129.99,in stock
TP-3300,"Painter's tape, 1.88 in, 6-pack",21.00,in stock
SF-1200,"Safety glasses, clear, 12-pack",24.99,in stock
BX-5502,"Contractor trash bags, 42 gal",32.00,out of stock`;

export const sampleStoreCSV = `SKU,Product name,Current price,Stock
HX-2210,Cordless impact driver kit,$139.00,In stock
LT-0451,"LED shop light, 4 ft, 2-pack",$54.00,Out of stock
SW-1092,"Shop vacuum, 12 gal",$139.99,In stock
TP-3300,"Painter's tape, 1.41 in, 6-pack",$21.00,In stock
SF-1200,"Safety glasses, clear, 12-pack",$2.49,In stock
BX-5502,"Contractor trash bags, 42 gal",$32.00,In stock
DR-8840,"Hammer drill, 1/2 in",$99.00,In stock`;
