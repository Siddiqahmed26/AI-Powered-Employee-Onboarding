import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Shield, User, Users } from 'lucide-react';
import type { AppRole } from '@/hooks/useUserRole';

interface UserData {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  department: string | null;
  role: string | null;
  current_day: number | null;
  app_role?: AppRole;
  created_at: string;
}

interface UserTableProps {
  users: UserData[];
  onUpdateRole: (userId: string, role: AppRole) => Promise<boolean>;
  onUpdateProfile: (userId: string, updates: { full_name?: string; department?: string; role?: string }) => Promise<boolean>;
  currentUserId?: string;
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  moderator: 'bg-primary text-primary-foreground',
  user: 'bg-secondary text-secondary-foreground',
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <Shield className="h-3 w-3" />,
  moderator: <Users className="h-3 w-3" />,
  user: <User className="h-3 w-3" />,
};

export const UserTable = ({ users, onUpdateRole, onUpdateProfile, currentUserId }: UserTableProps) => {
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', department: '', role: '' });
  const [saving, setSaving] = useState(false);

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      department: user.department || '',
      role: user.role || '',
    });
  };

  const handleSaveProfile = async () => {
    if (!editingUser) return;
    setSaving(true);
    const success = await onUpdateProfile(editingUser.user_id, editForm);
    setSaving(false);
    if (success) {
      setEditingUser(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    await onUpdateRole(userId, newRole);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name || 'Unnamed'}</span>
                      <span className="text-sm text-muted-foreground">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>{user.role || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Day {user.current_day || 1}/7</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.app_role || 'user'}
                      onValueChange={(value: AppRole) => handleRoleChange(user.user_id, value)}
                      disabled={user.user_id === currentUserId}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            User
                          </div>
                        </SelectItem>
                        <SelectItem value="moderator">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            Moderator
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update profile information for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editForm.department}
                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Enter position/role"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
