import { getUsers } from '@/http';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Calendar, Search, UserCog, AlertCircle, RefreshCw, UserPlus } from "lucide-react"
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
  avatar?: string;
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

  console.log("filter data user ", filteredData)

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
    switch (role.toLowerCase()) {
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
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              Loading user profiles...
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-muted-foreground text-center mb-4">
              We encountered an error while fetching user data. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no data
  if (filteredData.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users {searchTerm && `(Search: "${searchTerm}")`}
            </CardTitle>
            <CardDescription>
              {searchTerm
                ? "No users match your search criteria"
                : "Manage user accounts and permissions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No Users Found" : "No Users Yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm
                ? "Try adjusting your search terms or clear the search to see all users."
                : userRole === 'admin'
                  ? "Get started by adding your first user to the system."
                  : "Contact an administrator to add users to the system."}
            </p>
            <div className="flex gap-2">
              {searchTerm ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Clear Search
                </Button>
              ) : userRole === 'admin' ? (
                <Button asChild className="flex items-center gap-2">
                  <Link to="/dashboard/users/add">
                    <UserPlus className="h-4 w-4" />
                    Add Your First User
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modern card view for desktop
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6" />
                Users ({filteredData.length})
              </CardTitle>
              <CardDescription className="mt-1">
                Manage {userRole === 'admin' ? 'all users' : 'your account'} of the system
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="[&&]:pl-[28px] w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {userRole === 'admin' && (
                <Button asChild className="flex items-center gap-2">
                  <Link to="/dashboard/users/add">
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Modern Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((user) => (
              <Card key={user._id} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                <CardHeader className="p-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
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
                    <p className="text-sm mt-1 text-muted-foreground">Phone: {user.phone}</p>
                  )}
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link to={`/dashboard/users/${user._id}`}>
                      <UserCog className="h-4 w-4" />
                      Manage
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;
