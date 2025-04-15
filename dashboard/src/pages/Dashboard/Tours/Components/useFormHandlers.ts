import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema } from './formSchema';
import { JSONContent } from 'novel';

export const useFormHandlers = (editorContent: JSONContent) => {
  const defaultValues = {
    title: "",
    code: "",
    description: "",
    tourStatus: "Draft",
    price: 0,
    coverImage: "",
    file: "",
    category: [{
      label: '', value: ''}],
    outline: "",
    itinerary: [
      {
        day: "1",
        title: "",
        description: "",
        dateTime: undefined,
      }
    ],
    dates: {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      tripDuration: '',
    },
    include: "",
    exclude: "",
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
    gallery: [{
      image: ''
    }],
    map: "",
    location: {
      street: '',
      city: '',
      state: '',
      country: '',
      lat: '',
      lng: ''
    },
    discount: {
      percentage: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      isActive: false,
      description: "",
      discountCode: "",
      maxDiscountAmount: 0,
    },
    enquiry: true,
    isSpecialOffer: false,
    destination: "",
    pricePerType: "person",
    basePrice: 0,
    groupSize: 1,
    discountEnabled: false,
    discountPrice: 0,
    pricingOptionsEnabled: false,
    pricingOptions: []
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields: itineraryFields, append: itineraryAppend, remove: itineraryRemove } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });

  const { fields: factsFields, append: factsAppend, remove: factsRemove } = useFieldArray({
    control: form.control,
    name: 'facts' as const,
  });

  const { fields: faqFields, append: faqAppend, remove: faqRemove } = useFieldArray({
    control: form.control,
    name: 'faqs' as const,
  });

  const { fields: pricingFields, append: pricingAppend, remove: pricingRemove } = useFieldArray({
    control: form.control,
    name: 'pricingOptions' as const,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>, mutate: (data: FormData) => void) => {
    const formData = new FormData();
    
    // Add all form fields to FormData
    formData.append("title", values.title);
    formData.append("code", values.code.toUpperCase());
    formData.append("description", JSON.stringify(editorContent));
    formData.append("tourStatus", values.tourStatus);
    formData.append("price", values.price.toString());
    formData.append("coverImage", values.coverImage);
    if (values.file) formData.append('file', values.file);
    // Handle categories

    const categories = form.getValues('category');
    if (categories && Array.isArray(categories)) {
     categories.forEach((item, index) => {
       formData.append(`category[${index}][label]`, item.label);
       formData.append(`category[${index}][value]`, item.value);
     });
   }

    // if (values.category && values.category.length > 0) {
    //   values.category.forEach((cat) => {
    //     formData.append("category", cat.value);
    //   });
    // }

    if (values.outline) formData.append('outline', values.outline);

    // Handle itinerary

    const itinerary = form.getValues('itinerary');
    if (itinerary) {
      itinerary.forEach((item, index) => {
        if (item.day) formData.append(`itinerary[${index}][day]`, item.day);
        if (item.title) formData.append(`itinerary[${index}][title]`, item.title);
        if (item.description) formData.append(`itinerary[${index}][description]`, item.description);
        if (item.dateTime) formData.append(`itinerary[${index}][date]`, item.dateTime.toISOString());
      });
    }

    // if (values.itinerary && values.itinerary.length > 0) {
    //   // Ensure itinerary is an array before stringifying
    //   formData.append("itinerary", JSON.stringify(values.itinerary));
    // }

    // Handle dates
    const dates = form.getValues('dates');
    if (dates) {
      if (dates.tripDuration) formData.append('dates[tripDuration]', dates.tripDuration);
      if (dates.startDate) formData.append('dates[startDate]', dates.startDate.toISOString());
      if (dates.endDate) formData.append('dates[endDate]', dates.endDate.toISOString());
    }

    if (values.include) formData.append('include', values.include);
    if (values.exclude) formData.append('exclude', values.exclude);

    // Handle facts
    const facts = form.getValues('facts');
    if (facts && Array.isArray(facts)) {
      facts.forEach((fact, index) => {
        formData.append(`facts[${index}][title]`, fact.title);
        formData.append(`facts[${index}][field_type]`, fact.field_type);
        fact.value.forEach((value, valueIndex) => {
          formData.append(`facts[${index}][value][${valueIndex}]`, value);
        });
        formData.append(`facts[${index}][icon]`, fact.icon);
      });
    }

    // Handle faqs
    const faqs = form.getValues('faqs');
    if (faqs && Array.isArray(faqs)) {
      faqs.forEach((faq, index) => {
        formData.append(`faqs[${index}][question]`, faq.question);
        formData.append(`faqs[${index}][answer]`, faq.answer);
      });
    }
    // Handle gallery
    const gallery = form.getValues('gallery');
    if (gallery && Array.isArray(gallery)) {
      gallery.forEach((image, index) => {
        formData.append(`gallery[${index}][image]`, image.image);
      });
    }

   // Append map
   if (values.map) formData.append('map', values.map);

    // Handle location
    const location = form.getValues('location');
    if (location) {
      formData.append('location[street]', location.street);
      formData.append('location[city]', location.city);
      formData.append('location[state]', location.state);
      formData.append('location[country]', location.country);
      formData.append('location[lat]', location.lat.toString());
      formData.append('location[lng]', location.lng.toString());
    }

    // Handle discount
    if (values.discount) {
      // Ensure discount has all required fields and proper structure
      const cleanDiscount = {
        percentage: values.discount.percentage || 0,
        startDate: values.discount.startDate || new Date(),
        endDate: values.discount.endDate || new Date(new Date().setDate(new Date().getDate() + 30)),
        isActive: values.discount.isActive || false,
        description: values.discount.description || '',
        discountCode: values.discount.discountCode || '',
        maxDiscountAmount: values.discount.maxDiscountAmount || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      formData.append("discount", JSON.stringify(cleanDiscount));
    }

    formData.append("enquiry", values.enquiry ? "true" : "false");
    formData.append("isSpecialOffer", values.isSpecialOffer ? "true" : "false");
    formData.append("destination", values.destination || "");

    // Handle pricing options
    if (values.pricingOptions && values.pricingOptions.length > 0) {
      formData.append("pricingOptions", JSON.stringify(values.pricingOptions));
    }

    try {
      console.log("Form data before submission:", Object.fromEntries(formData.entries()));
      console.log("Form values:", values);
      
      // Make sure we're passing the FormData object directly to the mutation function
      mutate(formData);
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  return { 
    form, 
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
    pricingFields,
    pricingAppend,
    pricingRemove,
  };
};
