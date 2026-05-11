# Resolve Merge Conflicts and Integrate Features

Merge the local "CivicAI" features with the incoming "JANSAHAYAK" government theme to resolve conflicts and provide a unified, official-looking, yet AI-powered grievance redressal system.

## Proposed Changes

### [Component: Client Frontend]

#### [MODIFY] [App.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/App.jsx)
- Adopt the "JANSAHAYAK" layout and view management (`home`, `report`, `track`, `admin`).
- Integrate the `UserDashboard` view and its associated state (`userAadhar`, `isAuthenticated`) from the HEAD version.
- Ensure the header navigation includes links to Home, Report, Track, and User Dashboard (when authenticated).
- Clean up conflict markers.

#### [MODIFY] [Dashboard.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/components/Dashboard.jsx)
- Use the "JANSAHAYAK" admin panel styling.
- Integrate the advanced AI detection details (similarity score, AI confidence, image comparison modal) from the HEAD version into the resolution verification flow.
- Ensure `fetchData` correctly handles the `deptTokens` state if applicable, or merge it with the new API structure.
- Clean up conflict markers.

#### [MODIFY] [GrievanceForm.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/components/GrievanceForm.jsx)
- Use the "JANSAHAYAK" form layout.
- Ensure the success state uses the new success view.
- Remove redundant HEAD conflict markers at the end of the file.
- Clean up conflict markers.

#### [MODIFY] [AadharLogin.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/components/AadharLogin.jsx)
- Resolve the `onLogin` prop conflict by ensuring both `token` and `aadhar` are passed back if needed by the app state.
- Clean up conflict markers.

#### [MODIFY] [TrackStatus.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/components/TrackStatus.jsx)
- Merge the tracking result view, keeping the "JANSAHAYAK" styling but ensuring resolution proofs are displayed correctly.
- Clean up conflict markers.

## Verification Plan

### Automated Tests
- Run `npm run dev` in the client directory and verify that the application loads without syntax errors.

### Manual Verification
- Navigate through the "JANSAHAYAK" interface.
- Test the Aadhar login flow.
- Test grievance submission and verify the AI analysis (suggestions for department).
- Test the Admin panel: switch roles, view grievances, and test the "Resolve Case" flow with image capture.
- Verify that the "Track Status" functionality works with a valid tracking ID.
