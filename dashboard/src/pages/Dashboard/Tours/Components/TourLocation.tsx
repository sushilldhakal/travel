import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface LocationItem {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationField {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface TourLocationProps {
  // Using FieldValues for consistency with other form components
  form: UseFormReturn<FieldValues, any, undefined>;
  locationFields: LocationField[];
  locationAppend: (value: Partial<LocationItem>) => void;
  locationRemove: (index: number) => void;
}

const TourLocation: React.FC<TourLocationProps> = ({
  form,
  locationFields,
  locationAppend,
  locationRemove
}) => {
  const handleAddLocation = () => {
    locationAppend({ name: '', coordinates: { lat: 0, lng: 0 } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="map"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Map Iframe<br /></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Paste Iframe from google maps" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h2 className="text-lg font-medium mb-5 bold">Starting Address</h2>
          <div className="grid gap-2 mb-5">
            <FormField
              control={form.control}
              name="location.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address<br /></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2 mb-5">
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> City<br /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2 mb-5">
              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> State<br /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid gap-2 mb-5">
            <FormField
              control={form.control}
              name="location.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Country<br /></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Country" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2 mb-5">
              <FormField
                control={form.control}
                name="location.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Latitude<br /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Latitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2 mb-5">
              <FormField
                control={form.control}
                name="location.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Longitude<br /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Longitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <iframe src="https://www.google.com/maps/d/embed?mid=14cqfbihuJgRL5Sgdw4WQqVkXUPwgLDk&usp=sharing" className="w-full h-[500px]"></iframe>


        </div>
      </CardContent>
    </Card>
  );
};

export default TourLocation;
