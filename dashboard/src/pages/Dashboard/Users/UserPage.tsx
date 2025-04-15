import { getUsers } from '@/http';
import { Tour } from '@/Provider/types';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import useTokenStore from '@/store/store';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const UserPage = () => {
  const { token } = useTokenStore(state => state);
  const decodedToken = jwtDecode(token!);
  const userId = decodedToken.sub; // Assuming JWT has 'sub' field for user ID
  const userRole = decodedToken?.roles ? decodedToken?.roles : ''; // Assuming JWT has 'roles' field

  const [tableData, setTableData] = useState([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 10000, // in Milliseconds
  });

  useEffect(() => {
    if (data && !tableData.length) {
      if (userRole !== 'admin') {
        setTableData(data.data.filter(user => user._id === userId));
      } else {
        setTableData(data.data);
      }
    }
  }, [data, tableData.length, userId, userRole]);

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
        <div className="capitalize"><Link to={`/dashboard/users/${row.original._id}`}>{row.getValue("name")}</Link></div>
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

