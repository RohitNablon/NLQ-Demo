Project Title: Text2SQL / NLQ Agent - "Art of the Possible" Demo UI
1. Objective
Develop a high-fidelity, pre-sales React.js dashboard to showcase Natural Language Query (NLQ) and Text2SQL capabilities. The interface must demonstrate the transition from technical database onboarding (Admin View) to actionable business insights (User View).

2. Technical Stack & Environment
Framework: React.js (Strictly no Vite; use standard create-react-app or custom Webpack setup).

Styling: Plain CSS Modules 

Typography: Jost Font Family (Geometric Sans-serif).

Theme: Premium Dark Mode.

Background: #0D0D0D

Surface/Cards: #1A1A1A

Accent/Primary: #007BFF (or brand-specific blue)

Text: #E0E0E0

3. Global Design Requirements
Aesthetics: Clean, neat, and minimalist. Use generous whitespace and subtle borders (1px solid #333).

Typography: Ensure the Jost font is loaded via Google Fonts. Use weight 400 for body and 600 for headings.

Animations: Smooth transitions between views. Use subtle loading states for the "Thinking Trace."

4. View 1: Product Owner / Database Owner (The Foundation)
Goal: Show how the system is grounded in business logic and semantic knowledge.

Database Onboarding:

UI to select/input database connection details.

Status indicators for data sync and schema indexing.

Semantic Layer & KPI Engine:

Ontology Graph: A visual node-link graph (e.g., using react-force-graph) showing the relationship between database tables and Business KPIs.

KPI Definition: A list or table view where the user can define business metrics (e.g., "Monthly Active Users") and map them to SQL logic.

Use Case Onboarding: * Input field to provide "Business Context" (e.g., "This data store tracks renewable energy output across India").

5. View 2: End User (The Interaction)
Goal: Show the "Art of the Possible" through natural conversation and high-value insights.

Database Selection: A clean sidebar or dropdown allowing users to toggle between multiple datasets (e.g., Sales, Logistics, Asset Management).

Insight View (The Landing Page):

A grid of 10–15 "Synthesized Insight" cards.

Each card features a pre-generated question (e.g., "Show me the top 5 performing plants by efficiency").

NLQ Chat Interface:

Floating Chat Bar: Modern input field at the bottom.

Thinking & Agent Trace: When a user asks a question, display a "Trace" component:

Step 1: Understanding Intent (Text description).

Step 2: Logic Generation (Display the generated SQL in a code block).

Step 3: Data Fetching (Visual loader).

Output Actions:

Render results as beautiful charts (Bar, Line, or Pie).

PPTx Export: A button to "Export Insight to Presentation" that simulates or triggers a professional slide generation.

6. Development Priorities for Antigravity
Phase 1: Setup the Dark Theme and Jost font globally.

Phase 2: Build the ChatInterface with a functional "Agent Trace" component (collapsible steps).

Phase 3: Implement the OntologyGraph using a mock dataset to show table relationships.

Phase 4: Create the InsightGrid with the 10-15 recommended questions.

Phase 5: Ensure all UI elements are "number friendly" (high readability for data/metrics).

7. Success Criteria
The UI must feel like a premium, enterprise-grade product.

The transition from the "Thinking Trace" to the final chart must be seamless and visually impressive for a pre-sales demo.