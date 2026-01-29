import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserTable } from '@/components/UserManagement/UserTable';
import { ArrowLeft, RefreshCw, Shield, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useSupabaseAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const { users, loading: usersLoading, error, refetch, updateUserRole, updateUserProfile } = useUserManagement();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [roleLoading, isAdmin, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                User Management
              </h1>
              <p className="text-muted-foreground">Manage users and their roles</p>
            </div>
          </div>
          <Button variant="outline" onClick={refetch} disabled={usersLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.app_role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moderators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.app_role === 'moderator').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              View and manage all registered users. Assign roles and update profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                {error}
              </div>
            )}
            {usersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <UserTable
                users={users}
                onUpdateRole={updateUserRole}
                onUpdateProfile={updateUserProfile}
                currentUserId={user?.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
