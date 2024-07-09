import { getTours, deleteTours } from '@/http/api';
import { Tour } from '@/Provider/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown, CirclePlus, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { routePaths } from '@/router';
import { useState } from 'react';

const TourPage = () => {

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours,
    staleTime: 10000, // in Milli-seconds
  });

  // const alltours = data?.data.tours.map(object => ({ ...data }))
  // const check = Array.isArray(alltours)
  //@ts-ignore

  const mutation = useMutation({
    mutationFn: deleteTours,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tours']);
    },
    onError: (error) => {
      console.error("Error deleting tour:", error);
    }
  });

  const handleDeleteTour = async (tourId) => {
    try {
      await mutation.mutateAsync(tourId);
      console.log("success", "Tour deleted successfully");
    } catch (error) {
      console.log("error", error.message);
    }
  };


  const tableData = data?.data.tours;

  console.log(tableData);


  // data?.data.tours.map(getDetails)

  // function getDetails(tour) {
  //   console.log(tour);
  // }


  const columns: ColumnDef<Tour>[] = [

    {
      accessorKey: "coverImage",
      header: ({ column }) => {
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
      accessorKey: "name",
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
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Author",
      cell: ({ row }) => {
        return (
          <div>
            {row.original.author.map((autho, i) => (
              <div className="capitalize" key={i}>{autho.name}</div>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "price_usd",
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
        const price_usd = parseFloat(row.getValue("price_usd"))

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price_usd)

        return <div className="text-left font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
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
        <div className="capitalize">{row.getValue("status")}</div>
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
        const date = new Date(row.getValue("createdAt"))
        return <div className="text-left font-medium">{date.toLocaleDateString("en-US")}</div>
      },


    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tour = row.original

        return (
          <div>
            <Button className="mr-2 py-1 px-2" variant="outline">Edit</Button>
            <Button className="py-1 px-2" variant="destructive" onClick={() => handleDeleteTour(tour._id)}> Delete</Button>
          </div>
        )
      },
    },
  ]


  let content;

  const createTour = <div className="hidden items-center gap-2 md:ml-auto md:flex">
    <Link to={routePaths.dashboard.addTour}>
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
    content = <div>{createTour}<DataTable data={tableData} columns={columns} place="Filter Tours..." colum="name" /></div>;
  } else {
    content = <div>{createTour}"Please add tours to your database";</div>
  }

  return content
}

export default TourPage

