# PROJECT SensConverter | A universal Mouse Sensitivity Converter

## 1. ROLE AND OBJECTIVE

Act as a senior full-stack developer, software architect, UIUX designer, and testing engineer.

Build a production-oriented web application for converting mouse sensitivity between FPS and other supported video games, inspired by the functionality of httpswww.mouse-sensitivity.com but with a substantially more modern interface, better usability, and a distinctive "broadcast data sheet" visual identity.

The working project name is SensiCore. Keep the name, logo, colors, and branding easy to change later.

The application must allow anyone to use the main sensitivity calculator without registering, logging in, or providing personal information. User accounts must be an optional extension that unlocks cloud-saved configurations and personal profiles.

This is a real software project, not a static mockup, landing page, or prototype with fake functionality.

### Primary goals

1. Convert mouse sensitivity between supported games using game-specific formulas.
2. Calculate and compare cm360, eDPI where applicable, DPI, FOV, and other relevant settings.
3. Allow anonymous visitors to use the calculator immediately.
4. Offer optional accounts to save, organize, edit, and synchronize sensitivity profiles.
5. Provide a global cm360 reference profile that helps users maintain a consistent physical mouse movement distance across games.
6. Deliver a polished, responsive interface with a coherent, deliberately restricted visual system and excellent usability.
7. Design the architecture so additional games, formulas, features, and integrations can be added without rewriting the application.

Prioritize mathematical correctness, usability, performance, accessibility, and maintainability over unnecessary complexity.

---

## 2. FIRST ACTION INSPECT THE ENVIRONMENT AND SKILLS

Before writing code

1. Inspect the existing repository, its files, package manager, installed dependencies, framework, conventions, and current implementation.
2. Determine whether this is an existing application to extend or a new project to initialize.
3. Inspect the available OpenCode skills and identify which ones are relevant to
   - Frontend architecture and implementation.
   - UIUX and visual design.
   - TypeScript and application architecture.
   - Authentication and database design.
   - Testing, debugging, and code quality.
   - Accessibility and responsive design.
   - Performance and security.
4. Read the instructions for relevant skills before using them.
5. Reuse existing project conventions and useful dependencies whenever possible.
6. Do not activate, read, or follow every installed skill indiscriminately. Use skills selectively when they improve the result.
7. Avoid duplicating instructions or allowing conflicting skills to override the core requirements in this specification.

If the repository already contains useful code, preserve it and extend it instead of rebuilding everything unnecessarily.

Create a concise implementation plan and a task checklist. Then begin implementing the application.

Do not stop after writing a plan, producing a design document, or creating an attractive frontend.

---

## 3. TECHNICAL ARCHITECTURE

Inspect the existing stack first. If there is no established stack, use the following defaults unless a strong technical reason justifies a different choice.

- Framework Next.js with the App Router.
- Language TypeScript with strict type checking.
- Styling Tailwind CSS and reusable CSS variables.
- UI components Accessible, reusable components; use a component library only when it provides real value.
- Icons A consistent icon library such as Lucide.
- Authentication Supabase Auth.
- Persistent storage Supabase PostgreSQL with Row Level Security.
- Validation Zod or an equivalent schema validation library.
- Testing Vitest for unit tests and Playwright for essential end-to-end flows.
- Package manager Preserve the repository's existing package manager; otherwise use npm.
- Deployment target Vercel-compatible deployment, with documented environment configuration.

Keep the sensitivity calculation engine independent from the UI, authentication provider, and database.

Suggested separation

- `app` routes and application layouts.
- `components` shared interface components.
- `componentscalculator` sensitivity calculator and conversion results.
- `componentsgames` game selectors, game cards, and game-specific settings.
- `componentsprofile` account and saved-profile interfaces.
- `componentsui` reusable interface primitives.
- `libconversion` formulas, conversion engine, validation, and cm360 calculations.
- `libgames` game metadata and supported game profiles.
- `libauth` authentication helpers.
- `libdb` database access and persistence.
- `types` shared domain types.
- `tests` unit, integration, and end-to-end tests.
- `public` icons, logos, and static assets.

Adapt this structure to the framework and repository conventions where appropriate. Do not create empty folders or unnecessary abstraction layers just to match this example.

### Architecture requirements

- Separate calculation logic from presentation.
- Use typed, validated game definitions rather than scattered conditionals.
- Make it easy to add new games and conversion formulas.
- Avoid giant components and monolithic files.
- Avoid unnecessary dependencies and excessive abstractions.
- Do not introduce microservices, a complex state-management framework, or other infrastructure unless genuinely necessary.
- Do not store secrets in client-side code.
- Provide `.env.example` with placeholders, never real credentials.
- Make setup, database initialization, testing, and deployment reproducible.

---

## 4. CORE EXPERIENCE USE WITHOUT AN ACCOUNT

The calculator is the most important part of the application.

A visitor must be able to open the website and perform a conversion immediately. Do not place a login modal, account wall, or registration requirement in front of the calculator.

### Main calculator interface

Create a clear source-to-target conversion workflow.

Source configuration
- Source game.
- Mouse DPI.
- In-game sensitivity.
- Horizontal and vertical sensitivity where applicable.
- FOV.
- FOV measurement convention, where relevant.
- Aspect ratio or resolution where required by a game's conversion model.
- Relevant game-specific settings.

Target configuration
- Target game.
- Calculated target sensitivity.
- Target DPI, with an option to use the source DPI.
- Target FOV and relevant game-specific settings.
- Conversion method and assumptions.

The source and target game selectors must be searchable. Allow users to switch source and target games, preserving compatible settings when possible.

Provide useful defaults and sample configurations, but clearly distinguish defaults from values entered by the user.

### Conversion results

Show the most important result prominently

- Calculated target sensitivity.
- Source and target DPI.
- Source and target cm360, when the required parameters are known.
- The conversion method used.
- Relevant caveats or differences between the games.

Add quick actions to

- Copy the result.
- Swap source and target games.
- Edit the configuration.
- Reset the calculator.
- Save the configuration if logged in.
- Export or share a configuration when practical.

Use proper clipboard handling and show success or error feedback.

Do not display fabricated precision. Round results appropriately for each game and explain that the in-game value may need to be rounded to the game's accepted precision.

### Conversion method selector

Where mathematically meaningful, support different conversion objectives

1. 360° rotation preserve the physical mouse distance required for a complete horizontal rotation.
2. Monitor-distance conversion match perceived movement over a specified portion of the screen, where the game and FOV models allow it.
3. FOV-aware conversion account for differences in field of view and projection when the selected model supports it.
4. Game-specific conversion use a documented formula or verified conversion method for the particular game pair.

Do not present these methods as interchangeable. Explain what each method preserves and what it does not.

If a conversion method is not supported for a game, disable it or explain the limitation instead of silently substituting another formula.

---

## 5. THE GLOBAL cm360 PROFILE

Create a central concept called Global Sensitivity.

This represents the user's preferred physical mouse distance in centimeters for a complete horizontal 360-degree rotation.

Users should be able to

- Set their preferred global cm360.
- Enter their mouse DPI.
- Select a game and calculate a corresponding sensitivity from the global reference.
- Compare their current sensitivity with the global target.
- See how much physical mouse movement is required for a 90°, 180°, and 360° turn.
- Save their preferred global value to their account.
- Keep separate configurations for different DPI values or game-specific preferences when needed.

For supported game profiles, calculate the in-game sensitivity that corresponds to the user's global cm360.

The global reference is a physical measurement target, not a universal in-game sensitivity number. A value such as 30 cm360 can correspond to completely different in-game sensitivity values across games.

Do not imply that matching cm360 guarantees identical aim feel. FOV, movement, recoil, acceleration, input processing, scopes, and game-specific mechanics can all affect perceived sensitivity.

### Core mathematical model

For a game that uses a conventional yaw-based mouse sensitivity model

`cm360 = (360 × 2.54)  (DPI × sensitivity × yaw)`

Where
- `DPI` is the mouse's effective dots per inch.
- `sensitivity` is the game's effective sensitivity value.
- `yaw` is the game's documented rotation constant for that input configuration.

This formula is valid only when the game's input model matches the assumptions. Do not blindly apply it to every game.

For a supported game, the inverse calculation can be expressed as

`sensitivity = (360 × 2.54)  (DPI × targetCm360 × yaw)`

Validate all inputs, reject zero or negative values where inappropriate, and prevent division-by-zero errors.

Account for game-specific scaling, sensitivity multipliers, and input settings where applicable.

Where a game's formula is unknown or its behavior differs from this model, do not invent a yaw constant. Mark the conversion as unsupported or requiring verification.

Add unit tests for the formula, inverse calculation, input validation, and round-trip consistency.

---

## 6. GAME DATABASE AND UNIVERSAL SUPPORT

The product should be designed to cover as many relevant games as possible over time.

However, never claim that every game is supported until its conversion behavior has actually been implemented and verified.

Start with a curated collection of popular PC shooters, prioritizing games such as

- Counter-Strike 2.
- Valorant.
- Apex Legends.
- Overwatch 2.
- Fortnite.
- Rainbow Six Siege.
- Call of Duty titles.
- Battlefield titles.
- PUBG Battlegrounds.
- Escape from Tarkov.
- The Finals.
- Destiny 2.
- Team Fortress 2.
- Quake.
- Unreal Tournament.
- Other popular FPS games when reliable conversion information is available.

This is an initial priority list, not permission to invent formulas or claim full compatibility with every listed title.

For each game, maintain structured metadata such as

- Stable game ID.
- Display name.
- Developer or publisher where useful.
- Logo or icon reference, if available and legally usable.
- Supported platforms.
- Input model.
- Supported conversion methods.
- Sensitivity range and accepted precision, when verified.
- Yaw or rotation constant, when verified.
- DPI assumptions.
- FOV settings and conventions.
- Scope or ADS behavior, if supported.
- Formula source or documentation reference.
- Verification status.
- Known limitations.
- Last verification date, when applicable.

### Game registry design

Use a data-driven game registry.

Each game must declare which capabilities it supports. For example

- cm360 calculation.
- Sensitivity-to-sensitivity conversion.
- FOV-aware conversion.
- Scoped sensitivity.
- ADS sensitivity.
- Monitor-distance conversion.

A conversion must only be available when the required data and formula are present.

Create a clear interface for adding games and formulas without modifying the calculator's main UI.

Where reliable sources are available, document the origin of the formula and the assumptions behind it.

Do not scrape or copy proprietary databases without checking applicable terms. Prefer documented, independently verified formulas and legitimate sources.

If a game cannot yet be converted reliably, show it as unavailable, experimental, or awaiting verification rather than returning a misleading number.

---

## 7. OPTIONAL USER ACCOUNTS

Registration is optional and must not affect anonymous calculator usage.

### Authentication features

Implement

- Email and password registration.
- Login and logout.
- Email verification if supported by the configured provider.
- Password recovery.
- Persistent sessions.
- Appropriate loading, success, and error states.
- Protected account routes.
- A clear way to return to the public calculator without logging in.

Use the authentication provider's recommended secure session handling. Never implement password storage yourself.

Do not hardcode API keys, credentials, or administrative secrets.

### Account dashboard

Create a personal dashboard containing

- Global cm360 preference.
- Default mouse DPI.
- Saved game configurations.
- Recently used configurations.
- Favorite games.
- Last modified date.
- Quick access to the calculator.
- Profile settings.

### Saved sensitivity profiles

Users should be able to create, edit, rename, duplicate, and delete profiles.

A profile can contain

- Profile name.
- Game.
- DPI.
- In-game sensitivity.
- FOV.
- ADS or scope settings when supported.
- Conversion method.
- Calculated cm360 when available.
- Optional notes.
- Creation and modification timestamps.

Allow multiple profiles per game. For example, a user may want separate configurations for ranked play, casual play, hip-fire, or scoped aiming.

Support setting a preferred profile for each game.

Saving a profile must persist to the database. Do not implement account functionality with fake data or browser-only storage.

### Data model and security

Design a sensible relational schema for

- User profiles.
- Global sensitivity preferences.
- Saved sensitivity configurations.
- Favorite games or equivalent preferences if needed.

Use foreign keys, sensible indexes, constraints, and timestamps.

Enable Row Level Security on user-owned tables. Users must only be able to access or modify their own private records.

Validate all data on the server. Never trust a client-supplied user ID to authorize access.

If Supabase credentials are unavailable during development, the anonymous calculator must still work fully. Implement the public functionality first and provide clear instructions for configuring the account features.

Do not simulate a successful login or pretend that a configuration was saved remotely when the backend is unavailable.

---

## 8. BROADCAST DATA SHEET DESIGN SYSTEM

> Replaced on 2026-11-04. The original "Liquid Glass" direction (dark charcoal, translucent panels, backdrop blur, cyan/violet accents) is now an explicit anti-reference: it read as generic generated UI. The shipped system is "broadcast data sheet" (hoja de retransmisión). `DESIGN.md` is the normative implementation document; this section states the intent.

The application must look like a measurement tool, not a marketing landing page.

Use the visual language of a broadcast statistics sheet printed before a match: bone paper, ink, hairline rules, aligned figures and a single signal-yellow field reserved for what is live.

Do not place a translucent card over a generic dashboard. Establish a coherent, deliberately restricted system.

### Visual direction

- Bone paper background (`#e9e7de`), ink type (`#12140f`) and a raised paper tone for panels.
- One signal colour only: broadcast yellow (`#f2e23e`).
- Hairline rules of 1 px, and 2 px ink rules for structural section breaks.
- Corner radii from 0 to 2 px. No pills.
- No diffuse shadows, no glow, no coloured gradients, no glass, no backdrop blur.
- Status colours are darkened until they pass AA on paper: green, amber, red.
- High-contrast, readable typography with tabular figures.
- Tight groups, generous separation, obvious scale and weight steps.
- Crisp, restrained Lucide icons at 14–18 px.

Create hierarchy with type scale, tonal steps and rules, never with elevation.

Keep the signal colour under roughly 10% of any screen. The result stands out because the rest of the page refuses colour, not because everything else animates.

### Surfaces

Create reusable visual variants, such as

- Primary panel (1 px ink border, raised paper).
- Secondary panel (1 px hairline border, no fill).
- Data table (hairline rows, mono header, signal-yellow hover).
- Live strip under the header, fed by the calculator.
- Result surface (solid signal yellow, mono figure, cm/360 scale).
- Sunk formula block (darker paper).
- Inset input surfaces with a 3 px inner underline on focus.

Define consistent CSS tokens for

- Paper, raised paper, sunk paper and ink.
- Hairlines and strong hairlines.
- Signal yellow and its soft tint.
- Status colours.
- Corner radii.
- Spacing.
- Animation durations and a single easing curve.

Every component class lives in `@layer components` and every element reset in `@layer base`, so Tailwind utilities can still override layout classes. Do not reintroduce blurred, translucent or shadowed surfaces.

### Typography and layout

Use Archivo for display and body copy, and Martian Mono for labels, table headers, the live strip and every figure the user compares or copies.

Use tabular numerals for measurements that users compare. Prose never goes in mono; figures never go in the text face.

Design the main calculator as a data sheet: source and target configuration, the yellow result panel, and the cm/360 scale, with the evidence (yaw, verification status, formula) reachable in the same view or one click away. It should feel like a professional instrument, not an administrative form.

The source and target configurations should be easy to compare. On wide screens, use a balanced side-by-side layout. On smaller screens, stack the sections without losing the conversion flow.

### Motion and interaction

Implement subtle transitions for

- Opening and closing selectors.
- Switching games.
- Updating conversion results.
- Opening dialogs.
- Hovering over interactive surfaces.
- Saving configurations.
- Changing tabs.

Prefer CSS transitions and lightweight animations. Use an animation library only if it provides a meaningful improvement.

Respect `prefers-reduced-motion`.

Never sacrifice usability, accessibility, or performance for decorative effects.

### Responsive design

Support

- Desktop.
- Laptop.
- Tablet.
- Mobile.

The calculator must remain functional on touchscreens, including searchable selectors, numeric inputs, and copy actions.

Do not use fixed widths that break on smaller devices.

---

## 9. REQUIRED PAGES AND NAVIGATION

Implement a coherent navigation system with the following routes or equivalent route structures.

### A. Home  Calculator

The primary tool, accessible without an account.

Include
- Source game and settings.
- Target game and settings.
- Conversion method.
- Results.
- Global cm360 helper.
- Recent local calculator state if useful.
- Optional sign-in and save actions.

### B. Game Library

A searchable, filterable directory of games.

Show
- Game name.
- Icon where available.
- Supported conversion capabilities.
- Availability or verification status.
- A direct action to use the game in the calculator.

Never display fake compatibility badges.

### C. My Sensitivities

Requires login.

Include
- Saved profiles.
- Search and filtering.
- Favorites.
- Editing and deletion.
- Duplicate profile action.
- Quick loading into the calculator.

### D. Global Sensitivity

Allow users to configure and compare their global cm360 target.

For anonymous visitors, this should work without registration. Their settings may remain in memory or be stored locally, with transparent messaging.

Logged-in users should be able to save and synchronize their global preference.

### E. Account  Settings

Requires login.

Include
- Basic profile information.
- Default DPI.
- Global cm360 preference.
- Account security and session actions.
- Logout.
- Account deletion, if implemented safely.

### F. Methodology  About

Explain
- How sensitivity conversions work.
- What cm360 means.
- Differences between conversion methods.
- How game formulas are verified.
- Why identical cm360 does not guarantee identical aiming feel.
- Known limitations.

Avoid unsupported claims of perfect accuracy.

---

## 10. CALCULATOR UX DETAILS

Make the tool efficient for both new users and experienced players.

Requirements

- Search games by name.
- Support keyboard navigation in selectors.
- Use numeric input types and sensible validation.
- Preserve valid settings when changing games.
- Clearly distinguish editable fields from calculated values.
- Recalculate immediately when valid inputs change.
- Debounce only operations that actually need it.
- Avoid unnecessary page reloads.
- Provide contextual explanations for technical terms.
- Include useful empty states.
- Make errors understandable and actionable.
- Show which settings are required for a particular conversion.
- Make unsupported conversion modes visibly unavailable.
- Keep the primary conversion action easy to locate.
- Prevent invalid values from producing `NaN`, `Infinity`, or misleading results.

Do not overwhelm first-time visitors with every advanced setting.

Provide a simple default view and an expandable advanced-settings section for FOV, ADS, scopes, aspect ratio, and other game-specific parameters.

Use sensible defaults without silently replacing user-entered values.

---

## 11. ACCESSIBILITY, PERFORMANCE, AND SECURITY

### Accessibility

- Semantic HTML.
- Proper labels for inputs.
- Keyboard-accessible navigation and dialogs.
- Visible focus states.
- Sufficient contrast.
- Accessible status announcements for changing results.
- Correct dialog focus management.
- Reduced-motion support.
- No reliance on color alone to communicate errors or status.

### Performance

- Keep the conversion engine lightweight and deterministic.
- Avoid unnecessary client-side JavaScript.
- Avoid excessive animations and expensive blur layers.
- Use optimized assets.
- Lazy-load noncritical elements where appropriate.
- Avoid unnecessary requests to the database.
- Prevent avoidable re-renders in the calculator.
- Do not introduce a large dependency solely for a minor visual effect.

### Security

- Server-side validation of all persisted user data.
- Secure authentication and session handling.
- Row Level Security for private data.
- No credentials in source code.
- No sensitive information in logs.
- Appropriate handling of authentication errors.
- Safe database queries through the supported client or query layer.
- Rate limiting for sensitive endpoints if custom endpoints are introduced.
- No unnecessary collection of personal information.

---

## 12. TESTING AND MATHEMATICAL VALIDATION

Testing is mandatory.

Create unit tests for

- cm360 calculation.
- Inverse sensitivity calculation.
- DPI handling.
- Invalid or missing inputs.
- Game-specific formula selection.
- Sensitivity rounding.
- Conversion method availability.
- Unsupported game pairs.
- Preservation of precision during calculations.
- Correct handling of game-specific multipliers.

For formulas that are intended to be inverses, test that converting from sensitivity to cm360 and back returns the original value within a defined numerical tolerance.

Use known reference examples from reliable documentation to validate individual game formulas. Record the assumptions used in each test.

Create integration tests for the main calculator workflow.

Create end-to-end tests for at least these scenarios

1. An anonymous visitor opens the calculator and converts sensitivity between two supported games.
2. An anonymous visitor changes DPI and observes the updated calculation.
3. An anonymous visitor sets a global cm360 target.
4. An anonymous visitor encounters an unsupported conversion and receives a clear explanation.
5. A registered user signs in and saves a sensitivity profile.
6. The saved profile remains available after a page reload or a new session.
7. A user edits and deletes their own profile.
8. A user cannot access another user's private profiles.
9. The application works on a mobile-sized viewport.
10. Missing backend credentials do not break the public calculator.

Do not use invented game formulas merely to make tests pass.

---

## 13. IMPLEMENTATION WORKFLOW

Work in manageable phases. Do not attempt to write the entire application in a single enormous code-generation step.

### Phase 1 — Foundation

- Inspect the repository and relevant skills.
- Establish the design direction.
- Configure the framework and dependencies.
- Define the shared types and game registry.
- Implement the initial Liquid Glass design tokens.
- Build the main navigation and responsive layout.

### Phase 2 — Conversion engine

- Implement the formula engine independently of the UI.
- Add validated game profiles.
- Implement cm360 and inverse calculations where supported.
- Add conversion-method selection and capability checks.
- Create comprehensive unit tests.
- Verify formulas against documented reference examples.

### Phase 3 — Anonymous calculator

- Build the source and target game selectors.
- Implement all relevant input fields.
- Display live results.
- Add copy, swap, reset, and validation behavior.
- Add the global cm360 tool.
- Ensure the entire workflow works without authentication or a database connection.

### Phase 4 — Game library and visual refinement

- Implement game search and filtering.
- Add accurate compatibility information.
- Refine transitions, glass surfaces, typography, spacing, and responsive behavior.
- Verify that the visual design remains readable and performant.

### Phase 5 — Accounts and persistence

- Configure Supabase integration.
- Add the database schema and migrations.
- Implement authentication.
- Add saved profiles and global preferences.
- Configure Row Level Security.
- Test persistence and user isolation.

### Phase 6 — Quality assurance

- Run unit tests.
- Run integration tests.
- Run available end-to-end tests.
- Run linting and type checking.
- Build the production application.
- Fix actual errors rather than hiding or suppressing them.
- Test loading, empty, success, error, and unsupported states.
- Check desktop and mobile layouts.
- Review the finished UI for consistency and usability.

### Phase 7 — Delivery

Provide
- A working application.
- A clear project structure.
- A `.env.example`.
- Database migrations or schema files.
- Setup and development instructions.
- Instructions for configuring Supabase.
- Testing instructions.
- Deployment instructions.
- A concise summary of implemented features.
- An explicit list of supported games and verified conversion methods.
- A list of known limitations and unfinished features.

Keep the task checklist updated as work progresses.

Do not mark a task complete simply because its files have been created. Verify that it works.

---

## 14. IMPORTANT RULES FOR THE CODING AGENT

1. Do not stop at the plan. Start implementing the actual application.
2. Do not deliver only a landing page. The working calculator is the priority.
3. Do not require an account for core functionality.
4. Do not invent game formulas, yaw constants, or compatibility claims.
5. Do not fake authentication, persistence, or successful operations.
6. Do not overengineer. Prefer the simplest maintainable solution.
7. Do not blindly follow every installed skill. Read relevant instructions, resolve conflicts sensibly, and keep moving.
8. Do not replace working project code without a reason.
9. Do not leave buttons that look functional but do nothing.
10. Do not hide errors by suppressing type checks, lint rules, or test failures.
11. Do not spend the entire task polishing visual details while core functionality remains incomplete.
12. Do not stop to ask me questions for routine technical decisions. Choose sensible defaults and document important trade-offs.
13. If an external service requires credentials, implement the available functionality first and clearly document the missing configuration.
14. If context or execution time becomes limited, prioritize a working anonymous calculator, accurate conversion formulas, a coherent design system, and tests before adding secondary features.
15. Work directly in the repository, run the available commands, inspect the results, and fix problems.
16. Keep the implementation compatible with the project's actual environment and the installed dependencies.
17. Do not claim the project builds, passes tests, or is production-ready unless you have actually verified the relevant checks.

## 15. DEFINITION OF DONE

The project is ready for its initial release when

- A visitor can use the calculator without registering.
- At least the initial supported games have implemented and tested conversion formulas.
- cm360 calculations are correct for the game models that support them.
- Unsupported conversions are handled honestly.
- The global sensitivity reference works.
- The Liquid Glass interface is polished and responsive.
- Optional authentication works when correctly configured.
- Logged-in users can persist and retrieve their profiles.
- Database access is properly isolated between users.
- Core unit tests pass.
- The production build succeeds.
- Setup and deployment instructions are complete.

Start by inspecting the repository and the relevant installed skills. Then implement the application in phases, continuously testing your work. Your objective is to leave a functional, extensible product in the repository, not merely a plan or a collection of attractive mockups.