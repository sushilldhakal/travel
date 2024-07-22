import { getUsers } from '@/http/api';
import { Tour } from '@/Provider/types';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton';

const UserPage = () => {

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 10000, // in Milli-seconds
  });

  const tableData = data?.data;
  const columns: ColumnDef<Tour>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Users
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "password",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Password
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="text-left font-medium">{row.getValue("password")}</div>
      },
    },
    {
      accessorKey: "roles",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Roles
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("roles")}</div>
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
  ]
  let content;

  if (isLoading) {
    content = <div><Skeleton /></div>;
  }

  else if (isError) {
    content = <div>Error fetching tours. Please try again later.</div>;
  } else if (data && tableData.length > 0) {
    content = <div><DataTable data={tableData} columns={columns} place="Filter Users..." colum="name" /></div>;
  } else {
    content = <div>Please create users</div>
  }

  return content
}

export default UserPage

