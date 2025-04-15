import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatar } from '@/http';
import { useQuery } from '@tanstack/react-query';

interface TourUserAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  userName?: string;
}

/**
 * TourUserAvatar component for displaying user avatars in tour-related components
 * 
 * @param userId - The ID of the user whose avatar to display
 * @param size - The size of the avatar (sm, md, lg, xl)
 * @param className - Additional CSS classes to apply
 * @param showName - Whether to show the user's name next to the avatar
 * @param userName - The name of the user (optional, only used if showName is true)
 */
export const TourUserAvatar: React.FC<TourUserAvatarProps> = ({
  userId,
  size = 'md',
  className = '',
  showName = false,
  userName = ''
}) => {
  const [error, setError] = useState(false);

  // Fetch the user's avatar
  const { data: avatarUrl } = useQuery({
    queryKey: ['userAvatar', userId],
    queryFn: () => getUserAvatar(userId),
    enabled: !!userId && !error,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  // Size classes for different avatar sizes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Get initials for the fallback avatar
  const getInitials = () => {
    if (userName) {
      return userName.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
  };

  return (
    <div className={`flex items-center ${showName ? 'space-x-2' : ''}`}>
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage
          src={avatarUrl}
          alt="User Avatar"
          onError={() => setError(true)}
        />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      {showName && userName && (
        <span className="font-medium">{userName}</span>
      )}
    </div>
  );
};

export default TourUserAvatar;
