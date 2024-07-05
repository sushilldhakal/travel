import { getTours } from '@/http/api';
import { Tour } from '@/Provider/types';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from "@/userDefinedComponents/DataTable";
import {
  ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TourPage = () => {


  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours,
    staleTime: 10000, // in Milli-seconds
});

// const alltours = data?.data.tours.map(object => ({ ...data }))
// const check = Array.isArray(alltours)

const tableData = data?.data.tours

const columns: ColumnDef<Tour>[] = [
  
  {
    accessorKey: "tour_name",
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
      <div className="capitalize">{row.getValue("tour_name")}</div>
    ),
  },
  {
    accessorKey: "duration_days",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Durations
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-left font-medium">{row.getValue("duration_days")}</div>,
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


let list;
if(data){
   list = <DataTable data={tableData} columns={columns} place="Filter Tours..." colum="tour_name"/>
}else{
  list = "Please add tours to your database"
}


  return (

    <>
     <div>
{list}
</div>
    
    </>
   
  )
}

export default TourPage