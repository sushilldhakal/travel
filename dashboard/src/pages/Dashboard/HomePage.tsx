import { Button } from "@/components/ui/button"
import routePaths from "@/lib/routePath";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no Tours
          </h3>
          <p className="text-sm text-muted-foreground">
            You can start selling as soon as you add a Tours.
          </p>
          <Button className="mt-4">
            <Link to={routePaths.dashboard.addTour}>Add Tour</Link>
          </Button>
        </div>
      </div>

    </>

  )
}
export default HomePage;