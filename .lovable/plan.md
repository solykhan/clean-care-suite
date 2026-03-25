
## Plan: Full Login System with Role-Based Access Control

### What needs to be built

Currently authentication is disabled (ProtectedRoute bypasses all checks, Auth page redirects immediately to home). The goal is to re-enable it with two profiles:

- **Admin** — full access to all pages, forms, reports, customers, service agreements, runs, admin panel
- **Technician** — access to Technician Dashboard and Runs page only

### Access Matrix

```text
Route                         Admin   Technician
/                             ✓       ✗ (redirect to /technician-dashboard)
/customers                    ✓       ✗
/customers/new                ✓       ✗
/customers/:id                ✓       ✗
/service-agreements           ✓       ✗
/customer-service-form        ✓       ✗
/runs                         ✓       ✓
/runs/calendar                ✓       ✓
/customer-service-report      ✓       ✗
/service-reports              ✓       ✗
/service-report/:id           ✓       ✗
/service-report/:id/edit      ✓       ✗
/technician-dashboard         ✓       ✓
/admin/dashboard              ✓       ✗
/admin/users                  ✓       ✗
/auth                         public
```

### Steps

**1. Rebuild Auth page (`src/pages/Auth.tsx`)**
- Email + password login form (sign in + sign up tabs)
- On login success: check user role → redirect admin to `/`, redirect technician to `/technician-dashboard`
- Clean, professional design with the app name

**2. Re-enable ProtectedRoute (`src/components/ProtectedRoute.tsx`)**
- Check if user is logged in (`useAuth`)
- If not authenticated → redirect to `/auth`
- If loading → show spinner

**3. Create `TechnicianRoute` component (`src/components/TechnicianRoute.tsx`)**
- Similar to AdminRoute but for technician role
- Used to gate technician-only pages
- Also blocks if user is not technician or admin

**4. Update `App.tsx` routing**
- Wrap admin-only routes with `AdminRoute`
- Wrap technician + admin routes (runs, technician dashboard) normally under `ProtectedRoute`
- Add a new `RoleRedirect` on `/` that redirects technicians to `/technician-dashboard`

**5. Update `Index.tsx`**
- Remove `RoleSelectionDialog` (role is now assigned at signup, not manually selected)
- Keep the admin dashboard landing page intact

**6. Update `src/hooks/useAuth.tsx`**
- Add `role` to auth context so components can use it without separate queries
- Fetch the user's role from `user_roles` table after login

**7. Update `LogoutButton`**
- Already works correctly (signs out → navigates to `/auth`)

### Technical Details

- The `user_roles` and `has_role()` function already exist in the database — no schema changes needed
- On signup, user picks their role (admin/technician) via a simple role selection on the auth page
- RLS policies are already permissive for `user_roles` insert by authenticated users
- The `AdminRoute` component already works correctly — just needs auth to be re-enabled to gate it properly

### Files to modify/create

| File | Action |
|---|---|
| `src/pages/Auth.tsx` | Rebuild with email/password login + signup with role selection |
| `src/components/ProtectedRoute.tsx` | Re-enable authentication check |
| `src/hooks/useAuth.tsx` | Add `role` field to context |
| `src/components/TechnicianRoute.tsx` | New — blocks non-technicians/admins |
| `src/App.tsx` | Wrap routes with appropriate guards |
| `src/pages/Index.tsx` | Remove RoleSelectionDialog, keep admin landing |
