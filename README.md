# ShiftReady — Worker Decision-Support MVP

ShiftReady is a small React web application for casual and agency aged-care workers in Melbourne. It helps a worker decide whether a proposed shift is worthwhile after considering travel time and cost, then helps them prepare before leaving home.

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open the URL shown in the terminal (usually http://localhost:5173)
```

## Project Structure

```
src/
├── main.jsx                    Entry point
├── App.jsx                     Global state and screen routing
├── App.css                     App-level styles
├── index.css                   Global CSS variables and reset
├── components/                 Reusable components
│   ├── PrimaryButton.jsx       Teal action button
│   ├── TextInput.jsx           Labelled text/number input
│   ├── ScreenLayout.jsx        Page wrapper with teal header + stepper
│   ├── StepperBar.jsx          Progress-step indicator (from 21st.dev)
│   └── StepperBar.css          Stepper styles
└── screens/                    Application screens
    ├── LoginScreen.jsx         Demo email/password login
    ├── PreferencesScreen.jsx   Travel method and max travel time
    ├── ShiftDetailsScreen.jsx  Facility, date, times, hourly pay
    ├── TravelDetailsScreen.jsx Return travel time and cost
    ├── ShiftValueScreen.jsx    Calculated shift value breakdown
    ├── ChecklistScreen.jsx     Pre-shift preparation checklist
    └── ConfirmationScreen.jsx  Success confirmation
```

## Key Calculations

- **Gross Pay** = hourly pay × shift hours
- **Estimated Shift Value (before tax)** = gross pay − return travel cost
- **Effective Hourly Value** = shift value ÷ (shift hours + return travel time in hours)

## 21st.dev Component Integration

The `StepperBar` component was sourced from 21st.dev using the copy-prompt-and-implement workflow.

- **Source component:** [Stepper by Origin UI](https://21st.dev/origin-ui/stepper) (MIT License)
- **Workflow:** The component prompt was copied from 21st.dev and adapted from its original Tailwind/shadcn conventions to plain CSS using the project's existing CSS custom properties (`--teal`, `--teal-dark`, `--teal-light`, etc.)
- **No new dependencies were added.** The adaptation uses only React 18, plain CSS, and native ARIA attributes
- **Usage:** The stepper renders on the six worker-journey screens (Preferences through Confirmation), showing the user's progress through the shift-planning flow. It is display-only and does not affect navigation or calculations.

## Assessment Requirements Met

- React application with clear working navigation
- Four custom reusable components: `PrimaryButton`, `TextInput`, `ScreenLayout`, `StepperBar`
- Each component reused on at least two screens
- Parent-to-child props examples: `ScreenLayout` receives `title` and `children` from each screen; `StepperBar` receives `steps` and `currentStep` from `ScreenLayout`; `App.jsx` passes `formData` and `updateField` to each screen
- 21st.dev UI component integration (Origin UI Stepper, adapted to plain CSS)
- Accessible form labels (`htmlFor`/`id` via React `useId`), ARIA attributes on stepper
- Mobile-first responsive design with teal colour scheme
- All data entered by user (demo only, no real data)

## Tech Stack

- React 18
- Vite (build tool)
- Plain CSS with custom properties
