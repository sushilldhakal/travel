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
      price: '0',
      outline: '',
      itinerary: [{ day: '', title: '', description: '', dateTime: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });
  const onSubmit = async (values: z.infer<typeof formSchema>, mutate: (data: FormData) => void) => {
    const formdata = new FormData();
    formdata.append('title', values.title);
    formdata.append('code', values.code.toUpperCase());
    formdata.append('description', JSON.stringify(editorContent));
    formdata.append('tourStatus', values.tourStatus);
    formdata.append('price', values.price.toString());
    formdata.append('coverImage', values.coverImage);
    if (values.file) formdata.append('file', values.file);
    if (values.outline) formdata.append('outline', values.outline);

    const itinerary = form.getValues('itinerary');
    if (itinerary) {
      itinerary.forEach((item, index) => {
        if (item.day) formdata.append(`itinerary[${index}][day]`, item.day);
        if (item.title) formdata.append(`itinerary[${index}][title]`, item.title);
        if (item.description) formdata.append(`itinerary[${index}][description]`, item.description);
        if (item.dateTime) formdata.append(`itinerary[${index}][date]`, item.dateTime);
      });
    }

    try {
      await mutate(formdata);
      form.reset();
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  return { form, onSubmit, fields, append, remove };
};
