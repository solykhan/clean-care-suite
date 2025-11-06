import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";

const userSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  role: z.enum(["technician", "admin"]),
});

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string | null;
}

const AdminUserManagement = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"technician" | "admin">("technician");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase.functions.invoke('list-users');
      
      if (error) throw error;
      
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(true);
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: userToDelete.id }
      });

      if (error) throw error;

      toast.success(`User ${userToDelete.email} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = userSchema.safeParse({ email, role });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Create user account with signUp
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: Math.random().toString(36).slice(-12), // Random temp password
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;

      toast.success(`User created successfully! Login link sent to ${email}`);
      setEmail("");
      setRole("technician");
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Add a new technician or admin to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  maxLength={255}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Role</label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(value) => setRole(value as "technician" | "admin")} 
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technician" id="technician" />
                    <Label htmlFor="technician" className="cursor-pointer">Technician</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating User..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>
              List of all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No users found</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.last_sign_in_at && (
                          <p className="text-xs text-muted-foreground">
                            Last sign in: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role && (
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of registered users with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground p-8">No users found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No role</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : <span className="text-muted-foreground text-sm">Never</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{" "}
              <span className="font-semibold">{userToDelete?.email}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagement;