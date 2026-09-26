# Universal Copy & Streamlined UX Refactor

## Context & Objectives
Showcase was previously burdened with hyper-niche architectural and curatorial jargon (e.g., "Exhibition Plates Ingestion", "Creator Atelier", "Daylight Monograph", "Spatial Scenographer", "Gallery Corridor Void", "Curatorial Assessment").
The user requested a complete generalization and simplification of all copy across the app so that any professional (developers, engineers, writers, photographers, architects, designers, researchers) feels directly served.

## Key Changes
1. **Posts & Studio Wizard:**
   - Replaced "Plates" with "Images" or "Cover Image".
   - Replaced "Exhibition Statement" with "Description".
   - Replaced "Creator Atelier" with "Studio".
   - Simplified step titles: "Project Images", "Project Identity", "Description & Tags", "Review & Publish".

2. **Career & Credentials:**
   - Generalized placeholders across all 6 submodules (Experience, Academics, Skills, Credentials, Languages, Achievements).
   - Replaced "Certified Spatial Scenographer" with "AWS Solutions Architect, PMP, Professional License".
   - Replaced "Curated 14 exhibitions; co-authored daylight monograph" with "Led team of 8 engineers; increased user growth by 45%".

3. **Profile & Socials:**
   - Expanded specialties to include Software Engineering, Product Design, Web Development, Data Science, Writing, Photography, etc.
   - Cleaned up titles from "Curated Social & Portfolio Links" to "Social & Web Links".
   - Renamed "Exhibition Avatar" to "Profile Photo".

4. **Security & Account:**
   - Simplified warning dialogs, 2FA setup flows, and device session terminology.

5. **Shared Discovery & Layout:**
   - Updated 404 page ("The page you are looking for does not exist or has been moved").
   - Updated Footer and Feed directory labels from "Exhibition Feed" to "Explore & Feed" / "Community Directory".

## Verification
- `npm run build`: Succeeded with 0 errors.
- `npm run lint`: Passed with 0 errors.
