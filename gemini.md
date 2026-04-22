Project Title: MSU Aga Khan Museum Interactive QR Code System (Offline-First PWA)
Objective:
Build a simple, clean, and beginner-friendly Progressive Web App (PWA) that enhances the visitor experience at the MSU Aga Khan Museum. The system must allow users to scan QR codes, access artifact information, track their progress at the artifact level, and view a list of official completers. The system must work offline after initial load.
System Overview:
There are two types of QR codes:
1.	Entrance QR Code – opens the main PWA and initializes the app
2.	Station QR Codes (3 stations) – open specific station pages inside the app
The app must support offline-first functionality using caching, while some features (like completers list and registration) require internet.
Scope:
•	1 Entrance QR (main app entry point)
•	3 Stations
•	Each station contains multiple artifacts (e.g., 30–35)
•	Each artifact has its own detail page
•	No mini-game logic yet (only buttons/placeholders)
•	Focus on content display, artifact tracking, and system structure
Core Features:
1.	Entrance Flow
•	Entrance QR opens the Home Page of the PWA
•	Show:
o	Welcome message
o	Instructions
o	Button: "Start Exploring"
o	Button: "Install App (for offline use)"
•	Initialize caching of core files (PWA setup)
2.	Home Page (Dashboard)
•	Display:
o	List of 3 stations
o	Overall progress:
“You have viewed X out of Y artifacts”
o	Section: “Official Completers” (fetch from online database when available)
•	Include button:
o	“Play Games” (placeholder only, no functionality yet)
3.	Station Pages (3 total)
Each station page must include:
•	Station title
•	List of artifacts
•	Each artifact shows:
o	Name
o	Thumbnail image
o	Viewed indicator (Viewed / Not Viewed)
•	Show per-station progress:
“You have viewed X out of Y artifacts in this station”
4.	Artifact Detail Page
Each artifact page must include:
•	Artifact name
•	Image
•	Description (3–5 sentences)
•	References section
•	Automatically mark artifact as “viewed” when opened
5.	Artifact-Level Progress Tracking
•	Track viewed artifacts using localStorage
•	Store artifact IDs in an array
•	Compute:
o	Overall progress (total viewed / total artifacts)
o	Per-station progress
•	Update UI in real-time
6.	Completion Logic
•	When all artifacts are viewed:
o	Show message:
“You have completed the museum exploration”
o	Unlock button:
“Register as Completer”
7.	Registration System (Online Required)
•	When user clicks register:
o	Show form:
	Name
	Student ID Number
•	On submit:
o	Save data to Firebase (or similar online database)
•	Prevent duplicate Student ID registration
•	Show success message after submission
8.	Completers List (Home Page)
•	Fetch list of completers from Firebase
•	Display:
o	Name
o	Completion date
•	If offline:
o	Show cached list OR message:
“Connect to internet to view official completers”
9.	Game Section (Placeholder Only)
•	Add a “Play Games” button on Home Page
•	Add 3 buttons:
o	Game 1
o	Game 2
o	Game 3
•	Do NOT implement game logic yet
•	If clicked:
o	Show message:
“Games will be available in the next version”
10.	QR Code Routing
•	Entrance QR → opens Home Page
•	Station QR Codes:
o	/station1
o	/station2
o	/station3
•	Ensure pages can be accessed directly via URL
Technical Requirements:
•	Build as a Progressive Web App (PWA)
•	Include Service Worker for offline caching
•	Cache:
o	App shell (HTML, CSS, JS)
o	JSON data (artifact info)
o	Basic images (thumbnails)
•	Use localStorage for progress tracking
•	Use Firebase (or similar) for:
o	Registration
o	Completers list
Data Structure:
•	Use JSON files for artifact data:
o	station1.json
o	station2.json
o	station3.json
•	Each artifact includes:
o	id
o	name
o	description
o	image
o	references
Design Requirements:
- Mobile-first design
- Clean and simple user interface
- Fast loading and lightweight
- Large buttons for easy interaction
- Clear progress indicators

Color Theme:
- Primary colors: Maroon and Green
- Accent color: Slight Yellow (for highlights, buttons, or progress indicators)
- Use a balanced and professional combination suitable for a museum environment
- Ensure good contrast and readability (text must be easy to read)



UI Style:
- Minimalist and modern
- Avoid overly bright or distracting colors
- Use color hierarchy:
  - Maroon for headers/navigation
  - Green for primary buttons and actions
  - Yellow for highlights, progress bars, or important notifications
Expected Output:
•	Fully working PWA with:
o	Home Page
o	3 Station Pages
o	Artifact Detail Pages
o	Progress tracking system
o	Registration system (Firebase)
o	Completers list display
o	Placeholder game section
•	Provide:
o	Complete code (HTML, CSS, JS)
o	Service Worker implementation
o	Firebase setup instructions
o	Instructions on how to run and test the app
Important Notes:
•	Do NOT implement mini-games yet
•	Focus on a stable, offline-first system
•	Ensure all core features work before adding advanced features
•	Keep code simple, modular, and beginner-friendly
