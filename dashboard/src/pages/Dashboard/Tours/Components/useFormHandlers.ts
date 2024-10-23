import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema } from './formSchema';
import { JSONContent } from 'novel';

export const useFormHandlers = (editorContent: JSONContent) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      tourStatus: 'Draft',
      coverImage: '',
      file: '',
      price: 0,
      category: [{
        label: '', value: ''}],
      outline: '',
      itinerary: [{ day: '', title: '', description: '', dateTime: undefined }],
      dates: {
        tripDuration: '',
        startDate: undefined,
        endDate: undefined,
      },
      // Include and Exclude fields
      include: '', // An array of strings, can start with an empty string
      exclude: '', // An array of strings, can start with an empty string
      // Facts
      facts: [{
        title: '',
        field_type: 'Plain Text', // Default to 'Plain Text' as the field type
        value: [''],
        icon: ''
      }],
      // FAQs
      faqs: [{
        question: '',
        answer: ''
      }],
      // Reviews
      reviews: [{
        user: '',
        rating: 0,
        comment: ''
      }],
      // Gallery
      gallery: [{
        image: ''
      }],
      // Map URL
      map: '',
      location: {
        street: '',
        city: '',
        state: '',
        country: '',
        lat: '',
        lng: ''
      },
      enquiry: true,
    },
  });

  const { fields: itineraryFields, append: itineraryAppend, remove: itineraryRemove } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });

  const { fields: factsFields, append: factsAppend, remove: factsRemove } = useFieldArray({
    control: form.control,
    name: 'facts',
  });

  const { fields: faqFields, append: faqAppend, remove: faqRemove } = useFieldArray({
    control: form.control,
    name: 'faqs',
  });


  const onSubmit = async (values: z.infer<typeof formSchema>, mutate: (data: FormData) => void) => {
    const formdata = new FormData();
    formdata.append('title', values.title);
    formdata.append('code', values.code.toUpperCase());
    formdata.append('description', JSON.stringify(editorContent));
    formdata.append('tourStatus', values.tourStatus);
    formdata.append('price', values.price.toString());
    formdata.append('coverImage', values.coverImage);
    // Append included items
    if (values.include) formdata.append('include', values.include);
    if (values.exclude) formdata.append('exclude', values.exclude);
    if (values.file) formdata.append('file', values.file);
    if (values.outline) formdata.append('outline', values.outline);
    if (values.enquiry) formdata.append('enquiry', values.enquiry.toString());
     // Append categories
     const categories = form.getValues('category');
     if (categories && Array.isArray(categories)) {
      categories.forEach((item, index) => {
        formdata.append(`category[${index}][label]`, item.label);
        formdata.append(`category[${index}][value]`, item.value);
      });
    }
    const itinerary = form.getValues('itinerary');
    if (itinerary) {
      itinerary.forEach((item, index) => {
        if (item.day) formdata.append(`itinerary[${index}][day]`, item.day);
        if (item.title) formdata.append(`itinerary[${index}][title]`, item.title);
        if (item.description) formdata.append(`itinerary[${index}][description]`, item.description);
        if (item.dateTime) formdata.append(`itinerary[${index}][date]`, item.dateTime);
      });
    }

        // Append dates
    const dates = form.getValues('dates');
    if (dates) {
      if (dates.tripDuration) formdata.append('dates[tripDuration]', dates.tripDuration);
      if (dates.startDate) formdata.append('dates[startDate]', dates.startDate.toISOString());
      if (dates.endDate) formdata.append('dates[endDate]', dates.endDate.toISOString());
    }



    // Append facts
    const facts = form.getValues('facts');
    if (facts && Array.isArray(facts)) {
      facts.forEach((fact, index) => {
        formdata.append(`facts[${index}][title]`, fact.title);
        formdata.append(`facts[${index}][field_type]`, fact.field_type);
        fact.value.forEach((value, valueIndex) => {
          formdata.append(`facts[${index}][value][${valueIndex}]`, value);
        });
        formdata.append(`facts[${index}][icon]`, fact.icon);
      });
    }

    // Append FAQs
    const faqs = form.getValues('faqs');
    if (faqs && Array.isArray(faqs)) {
      faqs.forEach((faq, index) => {
        formdata.append(`faqs[${index}][question]`, faq.question);
        formdata.append(`faqs[${index}][answer]`, faq.answer);
      });
    }

    // // Append reviews
    // const reviews = form.getValues('reviews');
    // if (reviews && Array.isArray(reviews)) {
    //   reviews.forEach((review, index) => {
    //     formdata.append(`reviews[${index}][user]`, review.user.toString());
    //     formdata.append(`reviews[${index}][rating]`, review.rating.toString());
    //     formdata.append(`reviews[${index}][comment]`, review.comment);
    //   });
    // }

    // Append gallery images
    const gallery = form.getValues('gallery');
    if (gallery && Array.isArray(gallery)) {
      gallery.forEach((image, index) => {
        formdata.append(`gallery[${index}][image]`, image.image);
      });
    }

    // Append map
    if (values.map) formdata.append('map', values.map);

    // Append location
    const location = form.getValues('location');
    if (location) {
      formdata.append('location[street]', location.street);
      formdata.append('location[city]', location.city);
      formdata.append('location[state]', location.state);
      formdata.append('location[country]', location.country);
      formdata.append('location[lat]', location.lat.toString());
      formdata.append('location[lng]', location.lng.toString());
    }

    try {
      await mutate(formdata);
      //form.reset();
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  return { form, 
    onSubmit, 
    itineraryFields, 
    itineraryAppend, 
    itineraryRemove, 
    factsFields, 
    factsAppend, 
    factsRemove,
    faqFields, 
    faqAppend, 
    faqRemove, 
  };
};
