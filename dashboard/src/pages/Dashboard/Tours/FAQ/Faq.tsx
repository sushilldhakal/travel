
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFaq, deleteFaq } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
// import SingleFaq from "./SingleFaqs";
import AddFaq from "./AddFaq";
import { getUserId } from "@/util/AuthLayout";
import { FaqData } from "@/Provider/types";
import SingleFaq from "./SingleFaq";

const TourFaqs = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    // Fetch all faqs for the user
    const { data: faqs, isLoading, isError } = useQuery<FaqData[], Error>({
        queryKey: ['faqs', userId],
        queryFn: () => userId ? getUserFaq(userId) : Promise.reject('No user ID provided'),
        enabled: !!userId,
    });

    const handleDeleteFaqs = async (faqId: string) => {
        try {
            await deleteFaq(faqId);
            toast({
                title: 'Faq deleted successfully',
                description: 'The Faq has been removed.',
            });
            queryClient.invalidateQueries({
                queryKey: ['faqs', userId], // Match the query key used in useQuery
            });
        } catch (error) {
            toast({
                title: 'Failed to delete Faq',
                description: 'An error occurred while deleting the Faq.',
            });
        }
    };

    console.log("faqs", faqs)

    return (
        <div>
            <div className="mx-auto w-full max-w-6xl mt-6 grid gap-6">
                <AddFaq onFaqAdded={() => {
                    if (userId) {
                        queryClient.invalidateQueries(['faqs', userId]);
                    }
                }} />
            </div>

            <div className="mx-auto w-full max-w-6xl mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <p>Loading...</p>
                ) : isError ? (
                    <p className="text-red-600">Failed to load faqs</p>
                ) : faqs?.length ? (
                    faqs.map((faq) => (
                        <div key={faq.id} className="flex flex-col">
                            <SingleFaq
                                faq={faq}
                                DeleteFaq={handleDeleteFaqs}
                            />
                        </div>
                    ))
                ) : (
                    <p>No faqs found.</p>
                )}
            </div>
        </div>
    );
};

export default TourFaqs;
