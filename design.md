# 📌 Project Design Guidelines (UI/UX Specification)

This project must follow standard, professional, and consistent UI/UX practices across all pages. The design should utilize a strict design system for maximum consistency.

## 🎨 1. Design System & Foundation

### Typography & Spacing
* **Font Family**: Modern, highly legible fonts (e.g., `Inter`, `Roboto`, or `Poppins`).
* **Font Sizes**: Rely heavily on default browser sizing (`h1`, `h2`, `h3`, `p`, `small`) for standard text elements unless a specific design requires overriding.
* **Margin & Padding**: Use a definitive spacing scale (e.g., standard rem-based spacing across cards, layouts, and gaps). Every page should feel professionally aligned.

### Colors
* **Primary Palette**: Trustworthy transport theme (Blue / Indigo).
* **Secondary Palette**: Assorted Gray shades for backgrounds (`slate-50`, `white`), borders, and muted text.
* **Status Colors**: 
  * Success: Green
  * Warning: Yellow / Amber
  * Danger: Red
* **Consistency**: The color scheme must maintain high contrast for accessibility and persist uniformly across all roles (Commuters, Drivers, Authorities).

### **Universal App Elements (Missing from core spec)**
* **Notification / Toast System**: For immediate feedback on actions (e.g., "Login Successful", "Error: Missing data").
* **Loading & Empty States**: Consistent spinners or skeleton loaders when fetching data. Clear, friendly empty states when lists (like incidents or fleets) return no results.
* **Form Validation**: Clean error messages (e.g., red text below inputs) when users submit invalid or mismatched data.
* **404 / Not Found Page**: A branded fallback page if a user navigates to a broken link.
* **Responsive Layouts**: The UI must adapt cleanly to mobile portrait widths, transforming side-by-side grids into vertical stacks automatically.
* **Pagination**: Search results and long tables (like incidents and the authority fleet) must support structured pagination.

---

## 🧭 2. Core Navigation

### Navbar
The Navbar should be present on every authenticated page. The layout must display the following items in strict order:
1. **Transport Info (Brand Name / Logo)**
2. **Dashboard**
3. **Search Route**
4. **Manage Transport** (conditional: only if applicable/authorized)
5. **Profile**
6. **Logout**

---

## 🔐 3. Authentication

### Login Page
* Top heading clearly identifying the login.
* Email and Password form input fields.
* Primary "Login" button.
* "Or continue with" divider text, followed by secondary login options (e.g., alternate methods or explicit register buttons).

---

## 👤 4. Role: Normal Commuter

### Dashboard
1. Navbar
2. **Welcome Message**: Dynamic based on the time of day (Good Morning, Afternoon, Evening).
3. **Favorite Transport Detail**: Displayed in a card grid, with a clear link to "View Transport".
4. **My Incident Report**: List/grid of the user's previously submitted incidents.
5. **My Crowd Report**: List/grid of the user's previously submitted crowd density reports.

### Search Route Page
1. Navbar
2. **Search Header**:
   * Search Bar: Form for entering "Transport Name" or "Transport Number.
   * Search Button: Placed nearby.
3. **Extra Search Features**: Source, Destination, and Type selectors to refine the search.
4. **Search Results & Filters**: Dynamic rendering based on the initial search input. Search results provide filter options to narrow down.

### Transport View Page
1. Navbar
2. **Header Info**:
   * Transport Name as a prominent heading.
   * Paragraph (`<p>`) displaying Source and Destination.
3. **Cards Section** divided into two major functional columns/rows:
   * **Timeline**: Visual display showing all stops, their respective times, and the **current real-time position** of the transport.
   * **Fare Calculation**: Inputs for Source, Destination, and Type (restricted to only available types for that bus). A 'Calculate' button and the resulting fare display.
4. **Interactive Reports Section**:
   * **Incidents Report**:
     * Button: "Add Incident".
     * Display: Card grid showing existing reports for this transport.
     * Card contents: Reporter Username, Image (`img`), Incident Type, Severity badge, and Description.
     * **Incident Modal**: Includes "Upload Image" button, 'Incident Type' selector, 'Severity' scale/selector, Description textarea (optional), and Submit button.
   * **Crowd Report**:
     * Button: "Add Crowd Report".
     * Display: Lists recent reports utilizing an identifiable badge and username.

### Profile Page
1. Navbar
2. **Top Actions**: Heading "Profile" accompanied by two buttons at the top: **Edit** and **Change Password**. 
   * *Note: The email address is locked and cannot be edited.*
3. **Details Grid**: Shows all personal details of the user.
4. **Change Password Modal**: Requires 'Current Password' and 'New Password'.

---

## 🚌 5. Role: Driver / Conductor

### Dashboard
1. Navbar
2. Welcome Message (time-based).
3. **Allotted Transport**: Highlights their assigned vehicle with quick navigation/view link.
4. **Transport Incidents**: Readily shows active incident reports exclusively for their allotted transport.
5. Favorite Transport Detail (Card Grid with link).
6. My Incident Report.
7. My Crowd Report.

### Search Route Page
* Identical functionality and UI as the Normal Commuter.

### Transport View Page
1. Navbar
2. **Header Info**:
   * Transport Name (Heading).
   * Status indicators: Paragraph of Source/Destination.
   * **Driver Controls**: Buttons located near the header for **"Editing Current Available Seats"**, **"Updating Current Bus Position"**, and a dynamic **"Crowd Badge"**.
3. **Cards Section**: Timeline (stops, times, current position) and Fare Calculation (source, destination, restricted available type, calculate button/result).
4. **Interactive Reports Section**:
   * Incidents Report (Grid view with Username, Image, Type, Severity, Description).
   * Incident Modal (Upload Image, Type, Severity, Optional Description, Submit).
   * Crowd Report (List with badge and username).

### Profile Page
* Identical functionality and UI as the Normal Commuter.

---

## 🏢 6. Role: Transport Authority

### Dashboard
1. Welcome message.
2. **Key Performance Indicators (KPI Cards)**:
   * Total Transport count.
   * Bus count.
   * Train count.
   * Reports count.
3. **Active Fleet Table**: Lists all buses/transports strictly under the authority's control along with their **Available Seats**.
4. **Severity Matrix**: Displays all active incident reports linked to the respective transport, supplemented with an immediate **Delete** option for inappropriate/resolved reports.

### Search Route Page
* Identical functionality and UI as the Commuter / Driver.

### Transport View Page
* Identical functionality and UI as the Commuter / Driver.

### Profile Page
1. Lists all details of the Authority.
2. Edit option allows modifications to almost all fields, **specifically including Covered Districts**. *Email remains uneditable.*
3. Change Password operates exactly as other logins.

### Manage Transport Page
1. **Fleet Statistics**: Display Total Transport, Total Bus, and Total Train.
2. **Search & Filter**: Search bar targeting Transport Name or Number, supplemented by a Transport 'Type' filter.
3. **Fleet Operations Table**: Lists all transports with direct action buttons:
   * **Assign Staff**: Assign Drivers / Conductors.
   * **Edit Bus Details**: Opens the comprehensive full-edit interface.
   * **Delete Bus**: Permanently removes the entity.
   * **Pause Option**: Temporarily suspend the transport from active service.
4. **Assign Driver/Staff Modal**: 
   * Staff assignment works via an email-based Search. If the user's email is present directly assign them to this specific transport.
5. **Comprehensive Edit Model / Template**:
   * Shows completely populated current details: Transport Number, Name, Type, Operator, Amenities, Total Seats, and Vehicle Number.
   * **Route Details Suite**: Route Name, Origin, Destination.
   * ****Stop Management**: Options to Add, Edit, or Delete individual tracking stops.**
   * ****Schedule Management**: Options to Add, Edit, or Delete scheduled operational times.**
   * ****Pricing & Logistics Engine**: Inputs/Tables for Fare structure, Total Distance calculation, and Estimated Time to complete routes.**
   * If any changes are made during the edit cycle, it should dynamically update the target template upon save.
