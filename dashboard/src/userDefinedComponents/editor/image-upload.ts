import { createImageUpload } from "novel/plugins";
import { getUserId } from "@/util/authUtils";
import { addMedia } from "@/http";
import { toast } from "@/components/ui/use-toast";


const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], filename, { type: mimeType });
};


// Get userId using a function
const uploadImageFiles = async (files: File[]): Promise<string[]> => {
  const userId = getUserId();
  if (!userId) throw new Error('User ID is null');
  const formData = new FormData();
  files.forEach(file => {
    formData.append('imageList', file);
  });
  try {
    const response = await addMedia(formData, userId);
    if (response && response.urls) {
      return response.urls; // Ensure response contains URLs
    } else {
      throw new Error('No URLs in response');
    }
  } catch (error) {
    toast({
      title: 'Error uploading images',
      description: `${error}`,
      variant: 'destructive',
      duration: 9000,
    })
    throw error;
  }
};

// Image upload function
export const uploadFn = createImageUpload({
  onUpload: async (file: File | string) => {
    if (typeof file === 'string') {
      const [mimeType, base64] = file.split(';base64,');
      const extension = mimeType.split('/')[1];
      const filename = `image.${extension}`;
      file = base64ToFile(base64, filename, mimeType);
    }

    try {
      // Call the upload function
      const imageUrls = await uploadImageFiles([file]);
      return imageUrls[0]; // Assuming you want to return the first URL
    } catch (error) {
      toast({
        title: 'Error uploading images',
        description: `${error}`,
        variant: 'destructive',
      })
      throw new Error('Failed to upload image');
    }
  },
  validateFn: (file) => {
    if (typeof file === 'string') {
      // Additional validation for base64 strings if needed
      return true;
    }

    if (!file.type.includes("image/")) {
      toast({
        title: "Error",
        description: "File type not supported.",
        duration: 5000,
      })
      return false;
    }
    if (file.size / 1024 / 1024 > 10) {
      toast({
        title: "Error",
        description: "File size too big (max 10MB).",
        duration: 5000,
      })
      return false;
    }
    return true;
  },
});

