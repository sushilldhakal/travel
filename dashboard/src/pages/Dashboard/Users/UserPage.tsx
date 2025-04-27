import { getUsers } from '@/http';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Mail, Calendar, Search, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import useTokenStore from '@/store/store';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb } from "@/Provider/types";

interface UserData {
  _id: string;
  name: string;
  email: string;
  roles: string;
  phone?: string;
  createdAt: string;
  avatarUrl?: string;
}

const UserPage = () => {
  const { token } = useTokenStore(state => state);
  const decodedToken = jwtDecode<{ sub: string, roles?: string }>(token!);
  const userId = decodedToken.sub;
  const userRole = decodedToken?.roles || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState<UserData[]>([]);
  const [filteredData, setFilteredData] = useState<UserData[]>([]);

  // Set up breadcrumbs
  const { updateBreadcrumbs } = useBreadcrumbs();
  
  useEffect(() => {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Dashboard', href: '/dashboard', type: 'link' },
      { label: 'Users', href: '/dashboard/users', type: 'page' },
    ];
    updateBreadcrumbs(breadcrumbs);
  }, [updateBreadcrumbs]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 10000, // in Milliseconds
  });

  useEffect(() => {
    if (data && data.data) {
      let userData = data.data;
      if (userRole !== 'admin') {
        userData = data.data.filter((user: UserData) => user._id === userId);
      }
      setTableData(userData);
      setFilteredData(userData);
    }
  }, [data, userId, userRole]);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = tableData.filter(
        (user) => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.roles.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
  }, [searchTerm, tableData]);

  // Helper function to get badge color based on role
  const getRoleBadgeVariant = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'seller':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Render content based on loading/error state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="p-6 pt-0 flex items-center justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Users</CardTitle>
            <CardDescription>
              There was a problem loading the user data. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The server might be unavailable or there might be a network issue.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show empty state if no data
  if (filteredData.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          {userRole === 'admin' && (
            <Button asChild>
              <Link to="/dashboard/users/add">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Link>
            </Button>
          )}
        </div>

        <Card className="text-center p-10">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">No Users Found</CardTitle>
            <CardDescription>
              {searchTerm 
                ? "No users match your search criteria." 
                : "There are no users in the system yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchTerm ? (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            ) : userRole === 'admin' ? (
              <Button asChild className="mt-2">
                <Link to="/dashboard/users/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First User
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact an administrator to add users.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modern card view for desktop
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage {userRole === 'admin' ? 'all users' : 'your account'} of the system
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {userRole === 'admin' && (
            <Button asChild>
              <Link to="/dashboard/users/add">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Modern Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((user) => (
          <Card key={user._id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.roles)}>
                  {user.roles}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined: {formatDate(user.createdAt)}
              </div>
              {user.phone && (
                <p className="text-sm mt-1">Phone: {user.phone}</p>
              )}
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-end">
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/dashboard/users/${user._id}`}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Manage User
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
