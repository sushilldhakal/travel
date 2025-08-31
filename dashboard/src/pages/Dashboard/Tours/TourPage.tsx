import { getUsersTours, deleteTour } from '@/http';
import { Author, Tour } from '@/Provider/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { CirclePlus, ArrowUpDown, AlertCircle, MapPin, User, Calendar, Edit3, Trash2, Eye, ImageIcon, RefreshCw, MoreHorizontal } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import routePaths from '@/lib/routePath';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';
import { getUserId } from '@/util/authUtils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TourPage = () => {
  const { toast } = useToast()
  const currentUserId = getUserId();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours', currentUserId],
    queryFn: () => getUsersTours(currentUserId || ''),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({
        title: "Tour deleted successfully",
        description: "The tour has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting tour:", error);
    }
  });

  const handleDeleteTour = async (tourId: string) => {
    try {
      await mutation.mutateAsync(tourId);
    } catch (error) {
      toast({
        title: "Failed to delete tour",
        description: `An error occurred while deleting the tour. Please try again later.${error}`,
      });
    }
  };
  const tableData = data?.data?.data; // Access the actual tours array

  const columns: ColumnDef<Tour>[] = [
    {
      accessorKey: "coverImage",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Cover Image</span>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="image-area">
          <div className="relative group">
            <img
              className="w-12 h-12 object-cover rounded-lg border shadow-xs transition-transform group-hover:scale-105"
              src={row.getValue("coverImage")}
              alt={row.original.title || "Tour cover"}
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.jpg";
              }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Tour Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-xs">
          <Link
            to={`/dashboard/tours/edit_tour/${row.original._id}`}
            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {row.getValue("title")}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: () => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Author</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {Array.isArray(row.original.author) ? (
              row.original.author.map((author, i) => (
                <div className="flex items-center gap-2 font-medium text-muted-foreground" key={i}>
                  <User className="h-3 w-3" />
                  {author.name}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 font-medium text-muted-foreground">
                <User className="h-3 w-3" />
                {row.original.author && typeof row.original.author === 'object' && 'name' in row.original.author
                  ? (row.original.author as Author).name
                  : 'Unknown Author'}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: "Price",
      cell: ({ row }) => {
        // Check if tour has pricing options
        const pricingOptions = row.original.pricingOptions;
        if (pricingOptions && pricingOptions.length > 0) {
          const price = pricingOptions[0].price || 0;
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price);
          return <div className="text-left font-medium">{formatted}</div>;
        }
        // Check if tour has direct price field
        const directPrice = row.original.price || 0;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(directPrice);
        return <div className="text-left font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "tourStatus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("tourStatus")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Created Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt")
        return (
          <div className="text-sm text-muted-foreground">
            {createdAt ? moment(createdAt.toString()).format("MMM DD, YYYY") : "--"}
          </div>
        )
      }
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>Actions</span>
        </div>
      ),
      enableHiding: true, // Allow actions column to be hidden via column selector
      cell: ({ row }) => {
        const tour = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={`/dashboard/tours/edit_tour/${tour._id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit Tour
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteTour(tour._id || '')}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete Tour
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]


  // Render the page content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center">
          <div className="mx-auto w-fit rounded-full bg-destructive/10 p-3 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Unable to Load Tours</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            We encountered an issue while fetching your tours. Please check your connection and try again.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    // Force render DataTable for debugging
    if (data && data?.data && data.data.success && Array.isArray(data.data.data)) {
      return <DataTable data={data.data.data} columns={columns} place="Filter Tours..." colum="title" initialColumnVisibility={{ actions: false }} />;
    }

    // Empty state
    return (
      <div className="text-center py-16 px-8">
        <div className="mx-auto w-fit rounded-full bg-muted/50 p-4 mb-6">
          <MapPin className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No Tours Yet</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Start building your travel business by creating your first tour.
          Add destinations, itineraries, and pricing to get started.
        </p>
        <Link to={routePaths.dashboard.addTour}>
          <Button size="lg" className="gap-2">
            <CirclePlus className="h-5 w-5" />
            Create Your First Tour
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header with title and action button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MapPin className="h-6 w-6 text-primary" />
                Tour Management
              </CardTitle>
              <CardDescription className="text-base">
                Manage your tours, itineraries, and destinations with ease
              </CardDescription>
            </div>
            <Link to={routePaths.dashboard.addTour}>
              <Button className="gap-2">
                <CirclePlus className="h-4 w-4" />
                Add New Tour
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Main content */}
      <Card>
        <CardContent className="p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default TourPage
