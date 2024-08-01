import { getTours, deleteTour } from '@/http/api';
import { Tour } from '@/Provider/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown, CirclePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { routePaths } from '@/router';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';
import useTokenStore from '@/store';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const TourPage = () => {
  const { toast } = useToast()
  const { token } = useTokenStore(state => state);
  const decodedToken = jwtDecode(token);
  const currentUserRole = decodedToken.roles || "";
  const currentUserId = decodedToken.sub;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours,
  });

  const queryClient = useQueryClient();

  const [filteredTours, setFilteredTours] = useState([]);

  useEffect(() => {
    if (data) {
      if (currentUserRole === "admin") {
        setFilteredTours(data.data.tours);
      } else {
        const userTours = data.data.tours.filter(tour => tour.author.some(author => author._id === currentUserId));
        setFilteredTours(userTours);
      }
    }
  }, [data, currentUserRole, currentUserId]);




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
      console.log("error", (error as Error).message);
    }
  };
  const tableData = filteredTours;
  const columns: ColumnDef<Tour>[] = [
    {
      accessorKey: "coverImage",
      header: () => {
        return (
          <span>Image</span>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize image-area">
          <img className="w-10 h-auto" src={row.getValue("coverImage")} alt={row.getValue("coverImage")} />
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
          >
            Tours
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize"><Link to={`/dashboard/tours/edit_tour/${row.original._id}`}>{row.getValue("title")}</Link></div>
      ),
    },
    {
      header: "Author",
      cell: ({ row }) => {
        return (
          <div>
            {Array.isArray(row.original.author) ? (
              row.original.author.map((autho, i) => (
                <div className="capitalize" key={i}>{autho.name}</div>
              ))
            ) : (
              <div className="capitalize">{row.original.author.name}</div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const price_usd = parseFloat(row.getValue("price"))

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price_usd)

        return <div className="text-left font-medium">{formatted}</div>
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
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt")
        return createdAt ? moment(createdAt.toString()).format("LL") : ""
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tour = row.original

        return (
          <div>
            <Button className="py-1 px-2 mr-2" variant="outline">
              <Link to={`/dashboard/tours/edit_tour/${tour._id}`} className="py-1 px-2">
                Edit
              </Link>
            </Button>

            <Button className="py-1 px-2" variant="destructive" onClick={() => handleDeleteTour(tour._id)}> Delete</Button>
          </div>
        )
      },
    },
  ]


  let content;

  const createTour = <div className="hidden items-center gap-2 md:ml-auto md:flex">
    <Link to={routePaths.dashboard.addTour} className='top-12 right-5 absolute'>
      <Button>
        <CirclePlus size={20} />
        <span className="ml-2">Add Tour</span>
      </Button>
    </Link>
  </div>
  if (isLoading) {
    content = <div>{createTour}<Skeleton /></div>;
  } else if (isError) {
    content = <div>{createTour}Error fetching tours. Please try again later.</div>;
  } else if (data && data?.data.tours.length > 0) {
    content = <div>{createTour}<DataTable data={tableData} columns={columns} place="Filter Tours..." colum="title" /></div>;
  } else {
    content = <div>{createTour}"Please add tours to your database";</div>
  }

  return content
}

export default TourPage

