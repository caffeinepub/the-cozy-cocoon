# The Cozy Cocoon - Product Manager

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Product management app with two pages: Stock and Sold
- Product fields: photo (image upload), cost price (₹), selling price (₹), status checkbox (stock/sold)
- When checkbox is set to "sold", product automatically moves from Stock page to Sold page
- Add product form with all fields
- Persistent storage of all records from day 1
- Beautiful, polished UI

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Products stored with fields - id, name, photo (blob URL), costPrice, sellingPrice, status (stock | sold), createdAt
2. Backend APIs: addProduct, getStockProducts, getSoldProducts, updateProductStatus, getAllProducts
3. Frontend: Two-tab layout (Stock / Sold), Add Product modal/form with image upload, product cards showing photo + prices in ₹, checkbox to toggle stock/sold status
4. Blob storage for product photos
5. Authorization for access control
