# Product Requirements Document (PRD)
**Product Name:** Enterprise F&B SaaS - Admin, POS & KDS Panel 
**Tenant Focus:** Mie Pedas Juara (Multi-Branch F&B Concept)
**Document Version:** 1.0
**Language:** English

---

## 1. Executive Summary
This document outlines the product requirements for the **Admin, POS, and KDS Panel**, a core module of the Enterprise F&B SaaS ecosystem. Designed specifically to handle high-traffic restaurant operations like "Mie Pedas Juara," the system integrates a Point of Sale (POS) for cashiers, a Kitchen Display System (KDS) for chefs, and a comprehensive, dynamic multi-tab Admin Dashboard to manage 20+ relational database tables. 

The goal is to provide a zero-loading, intuitive, and unified back-office experience that bridges frontend customer orders (QR/Web-App) with backend kitchen and management operations.

---

## 2. User Personas
1.  **The Cashier (e.g., Putri):** Needs a fast, robust interface (POS) to input orders, apply customer details, manage shifts, and checkout customers quickly to minimize queues.
2.  **The Kitchen Staff (e.g., Chef Juna):** Needs a touch-friendly, visual tracking board (KDS) to see incoming orders, mark items as "Preparing," and finalize them for serving without using a keyboard.
3.  **The Headquarter / Branch Admin:** Needs a bird's-eye view of the entire operation. Requires full CRUD (Create, Read, Update, Delete) access to menus, stock ledgers, CRM, and financial logs through a clean, relational data table interface.

---

## 3. Core Applications (Operational Interfaces)

### 3.1 Point of Sale (POS) App
A dedicated, rapid-entry interface for cashiers to process orders manually.
*   **Visual Grid:** Displays available products (e.g., *Paket Combat A*, *Mie Spesial*, *Udang Keju*) with image thumbnails and base prices.
*   **Order Type Selector:** Toggle between *Dine In*, *Take Away*, and *Delivery*.
*   **Dynamic Cart:** Adjust quantities with +/- buttons. Auto-calculates Subtotal, PB1 Tax (10%), and Service Charge (5%).
*   **CRM Integration:** Optional text field to attach a Customer Name or phone number to the receipt.
*   **Instant KDS Dispatch:** Clicking "Process Order" automatically generates an Order ID (e.g., `MP-001`) and pushes the data to the Kitchen Display System without refreshing the page.

### 3.2 Kitchen Display System (KDS) App
A real-time monitor interface for kitchen routing (e.g., Hot Kitchen vs. Beverage Bar).
*   **Smart Routing:** Displays only orders relevant to the specific station.
*   **Active Queue Dashboard:** Shows total active queues and highlights incoming tickets.
*   **Touch-Optimized Workflow:** 
    *   **Pending Tickets (Amber):** Displays "Start Cooking" button. Clicking updates status to `Preparing`.
    *   **Preparing Tickets (Blue):** Displays "Ready to Serve" button. Clicking updates status to `Completed` and removes the ticket from the active queue.
*   **Order Details:** Displays Order ID, Order Type, Table Number (if Dine-In), and exact item quantities.

---

## 4. Admin Dashboard (Dynamic Table Modules)

The back-office utilizes a smart, dynamic table engine. Instead of navigating 20+ isolated pages, tables are grouped into logical business modules using a **Multi-Tab Interface**. The system automatically resolves foreign keys (e.g., showing "Tebet Branch" instead of `branch_id: 3`).

### 4.1 Catalog & Menu Module
Manages the core offering and variants.
*   **Products:** Master menu list with Image URL, Category dropdown, Base Price, and Customizable flag.
*   **Categories:** Order and group menus (e.g., *Paket Hemat*, *Ala Carte Mie*).
*   **Modifier Groups & Options:** Manages spiciness levels (e.g., *Mie Level 1*, *Mie Level 3*) and add-ons.

### 4.2 Inventory Module
Manages physical stock and availability per branch.
*   **Branch Products:** Toggle ON/OFF availability for specific branches and track exact physical stock.
*   **Branch Modifiers:** Manage availability for specific variants.
*   **Stock Ledgers:** Immutable audit trail logging who (User ID) added or deducted stock, the movement type (`in` or `sale`), and the reference receipt number.

### 4.3 Sales & Transactions Module
Tracks financial inflow and historical orders.
*   **Orders:** Displays Grand Total, Order Type, and Payment Status.
*   **Order Items:** Line-by-line breakdown of sold products.
*   **Reservations (DP):** Tracks table bookings, arrival times, and 50% Down Payment status.
*   **Order Reviews:** Captures 1-5 star ratings and text reviews linked to specific customers.

### 4.4 HR & CRM Module
Manages internal staff and external customer loyalty.
*   **Users:** Staff management (Roles: Cashier, Kitchen, Driver) and POS PIN codes.
*   **Cashier Shifts:** Tracks opening balances and shift statuses (Open/Closed) to prevent cash fraud.
*   **Customers:** CRM database tracking total visits and Customer Lifetime Value (CLV).
*   **Coupons:** Manages promotional codes (e.g., `POTONGAN10K`), discount types (Nominal/Percentage), and minimum purchase requirements.

### 4.5 System Settings Module
Configures infrastructure rules.
*   **Branches & Areas:** Setup branch locations and physical layout zones (e.g., *Lantai 1 - Indoor*).
*   **Tables:** Maps individual tables and their seat capacities to specific areas.
*   **Tax Configs:** Defines regional taxes (PB1) and service charges applicable per branch.
*   **KDS Stations:** Defines routing destinations (e.g., *Hot Kitchen*, *Beverage Bar*).

---

## 5. Technical Specifications & Features

### 5.1 Dynamic CRUD Engine
*   **Auto-Generated Forms:** Clicking "Add New" or "Edit" on any table automatically generates a modal form based on the schema configuration.
*   **Smart Renderers:**
    *   *Booleans* render as True/False dropdowns or visual Check/Cross icons.
    *   *Relations* render as searchable Dropdowns (e.g., selecting a Category name instead of typing a Category ID).
    *   *Images* render with a visual thumbnail preview box.
    *   *Currencies* render with auto-formatting (IDR).

### 5.2 Navigation & Performance
*   **Global Search:** A unified search bar that scans across all visible columns within the active table.
*   **Pagination:** Client-side (or server-side ready) pagination limiting views to 10 rows per page to maintain optimal DOM performance.
*   **State Management:** Built leveraging React `useMemo` and local state for instant filtering and zero-loading transitions between tabs.

---

## 6. Database Mapping (Mie Pedas Juara Seeders)

The application perfectly mirrors the established PostgreSQL schema and seeds:
*   **Brand Entity:** Mie Pedas Juara (ID: 2)
*   **Branch Entities:** Tebet (ID: 3), Antapani (ID: 4)
*   **Role Setup:** Putri (Cashier), Chef Juna (Kitchen)
*   **Products Seeded:** Paket Combat A, Mie Spesial, Udang Keju, Es Teh Manis.
*   **Modifiers Seeded:** Level Pedas (Level 1, 3, 5), Topping (Udang Rambutan, Udang Keju).

---

## 7. Acceptance Criteria (Definition of Done)
1.  **POS Flow:** Cashier can successfully add items to the cart, select order type, and checkout. The transaction must reflect immediately in the `orders` table.
2.  **KDS Flow:** Chef can view the newly created order in the KDS monitor, change the status to `Preparing`, and subsequently to `Completed`. The ticket must leave the active queue upon completion.
3.  **Admin Flow:** Admin can navigate through all 5 sidebar modules, switch between tabbed tables, search for specific records, and successfully perform CRUD operations without application crashes.
4.  **UI/UX Compliance:** The interface must strictly adhere to the brand guidelines (Pink theme for Mie Pedas Juara), be fully responsive, and function without requiring page reloads (SPA architecture).
```eof