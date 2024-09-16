
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFacts, deleteFacts } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
// import SingleFact from "./SingleFacts";
import AddFact from "./AddFacts";
import { getUserId } from "@/util/AuthLayout";
import { FactData } from "@/Provider/types";
import SingleFact from "./SingleFacts";

const TourFacts = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    // Fetch all facts for the user
    const { data: facts, isLoading, isError } = useQuery<FactData[], Error>({
        queryKey: ['facts', userId],
        queryFn: () => userId ? getUserFacts(userId) : Promise.reject('No user ID provided'),
        enabled: !!userId,
    });

    const handleDeleteFacts = async (factId: string) => {
        try {
            await deleteFacts(factId);
            toast({
                title: 'Fact deleted successfully',
                description: 'The Fact has been removed.',
            });
            queryClient.invalidateQueries({
                queryKey: ['facts', userId], // Match the query key used in useQuery
            });
        } catch (error) {
            toast({
                title: 'Failed to delete Fact',
                description: 'An error occurred while deleting the Fact.',
            });
        }
    };

    console.log("facts", facts)

    return (
        <div>
            <div className="mx-auto w-full max-w-6xl mt-6 grid gap-6">
                <AddFact onFactAdded={() => {
                    if (userId) {
                        queryClient.invalidateQueries(['facts', userId]);
                    }
                }} />
            </div>

            <div className="mx-auto w-full max-w-6xl mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <p>Loading...</p>
                ) : isError ? (
                    <p className="text-red-600">Failed to load facts</p>
                ) : facts?.length ? (
                    facts.map((fact) => (
                        <div key={fact.id} className="flex flex-col">
                            <SingleFact
                                fact={fact}
                                DeleteFact={handleDeleteFacts}
                            />
                        </div>
                    ))
                ) : (
                    <p>No facts found.</p>
                )}
            </div>
        </div>
    );
};

export default TourFacts;
