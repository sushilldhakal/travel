import { TourDates } from "./TourDates";
import { TourPricing } from "./TourPricing";



const TourPricingDates = () => {



  return (
    <div id="pricing" className="space-y-8">
      <TourPricing />
      <TourDates />
    </div>
  );
};

export default TourPricingDates;