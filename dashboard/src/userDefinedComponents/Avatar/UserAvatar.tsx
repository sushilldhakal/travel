import { useQuery } from '@tanstack/react-query';
import { getUserAvatar } from '@/http';
import defaultAvatar from '@/assets/img/avatar.png';

interface UserAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const UserAvatar = ({ userId, size = 'md', className = '', alt = 'User avatar' }: UserAvatarProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const sizeClass = sizeClasses[size];

  // Use React Query to fetch and cache the avatar
  const { data: avatarData, isLoading } = useQuery({
    queryKey: ['userAvatar', userId],
    queryFn: () => getUserAvatar(userId),
    enabled: !!userId,
    staleTime: 0, // Consider data stale immediately so it refetches when needed
    refetchOnWindowFocus: false,
  });

  const avatarUrl = avatarData?.avatar || null;

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {isLoading ? (
        <div className={`${sizeClass} rounded-full bg-gray-200 animate-pulse`} />
      ) : (
        <img
          src={avatarUrl || defaultAvatar}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover border border-gray-200`}
          onError={(e) => {
            // Fallback to default avatar if the URL fails to load
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;
