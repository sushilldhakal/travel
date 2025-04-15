import { useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { uploadAvatar } from '@/http';
import UserAvatar from './UserAvatar';
import { Camera, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showEditButton?: boolean;
  onAvatarChange?: (avatarUrl: string) => void;
  disabled?: boolean;
}

const AvatarUploader = ({
  userId,
  size = 'lg',
  className = '',
  showEditButton = true,
  onAvatarChange,
  disabled = false
}: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleAvatarSelect = async (imageUrl: string | string[] | null) => {
    if (!imageUrl || Array.isArray(imageUrl)) return;

    try {
      setIsUploading(true);

      // Show a loading toast
      const toastId = toast.loading('Updating your avatar...');

      // Call the API to update the user's avatar with the image URL
      const result = await uploadAvatar(userId, imageUrl);

      // Immediately update the cache with the new avatar URL
      queryClient.setQueryData(['userAvatar', userId], {
        success: true,
        avatar: result.data.avatar
      });

      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['userAvatar', userId] });

      // Call the callback if provided
      if (onAvatarChange && result.data.avatar) {
        onAvatarChange(result.data.avatar);
      }

      // Update the loading toast to success
      toast.success('Avatar updated successfully!', {
        id: toastId,
        description: 'Your new avatar is now visible across the application.'
      });

      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`cursor-pointer ${showEditButton && !disabled ? 'hover:opacity-90' : ''}`}
              onClick={showEditButton && !disabled ? () => setDialogOpen(true) : undefined}
            >
              <UserAvatar userId={userId} size={size} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {showEditButton && !disabled ? 'Click to change avatar' : disabled ? 'You cannot edit this avatar' : 'Avatar'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showEditButton && !disabled && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setDialogOpen(true)}
              disabled={isUploading || disabled}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="asDialog max-w-[90%] max-h-[90%] overflow-auto">
            <DialogHeader>
              <DialogTitle>Select Avatar</DialogTitle>
              <DialogDescription>
                Choose an image from your gallery to use as your avatar.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <GalleryPage
                onImageSelect={handleAvatarSelect}
                isGalleryPage={false}
                activeTab="images"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AvatarUploader;
