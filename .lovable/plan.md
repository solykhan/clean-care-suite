

## Plan: Add "Revert" Tag and Restore Functionality for Transferred Runs

### Problem
When runs are transferred from Technician A to B, admins need a way to easily give them back to the original technician when they return — without losing track of who originally owned them.

### Current State
- `original_technicians` column already stores the original tech name
- `transferred` flag already marks transferred runs
- A small "Originally: ..." text is shown, but there's no easy way to revert

### Changes

**1. Add a visible badge/tag for the original technician**
- In the Technicians column, show a colored `Badge` (e.g., orange/amber) with the original technician name when a run is transferred
- Format: current tech in red + badge like `↩ Original Tech Name`

**2. Add a "Revert" button to restore runs back to original technician**
- Add a "Revert Transfer" button next to the Transfer button
- When clicked, it takes all selected transferred runs and:
  - Sets `technicians` back to `original_technicians`
  - Clears `original_technicians` to `null`
  - Sets `transferred` to `false`
- Only enabled when selected runs include transferred runs

**3. File changes**
- `src/pages/RunDashboard.tsx`:
  - Add `revertMutation` using `useMutation` to restore selected runs
  - Update the Technicians cell to show an amber badge with original tech name
  - Add "Revert" button in the transfer card, enabled only when transferred runs are selected
  - Import `Undo2` icon from lucide-react

### Technical Details
- The revert mutation updates each selected run where `transferred === true`:
  ```sql
  UPDATE runs SET technicians = original_technicians, original_technicians = NULL, transferred = false WHERE id = ?
  ```
- Badge styling: `bg-amber-100 text-amber-800` for the original technician tag
- The `original_technicians` value is preserved across multiple transfers (already handled — only set if null)

