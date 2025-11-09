/**
 * Application Constants
 * Centralized location for all constant values
 */

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        VERIFY: '/api/auth/verify',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
    },

    // Tours
    TOURS: '/api/tours',
    TOUR_SEARCH: '/api/tour-search',
    TOUR_SETTINGS: '/api/tour-settings',

    // Users
    USERS: '/api/users',

    // Reviews
    REVIEWS: '/api/reviews',

    // Categories
    CATEGORIES: '/api/categories',

    // Facts
    FACTS: '/api/facts',

    // FAQs
    FAQS: '/api/faqs',

    // Posts
    POSTS: '/api/posts',

    // Comments
    COMMENTS: '/api/comments',

    // Media/Gallery
    MEDIA: '/api/media',
    GALLERY: '/api/gallery',

    // Destinations
    DESTINATIONS: '/api/global/destinations',

    // Subscribers
    SUBSCRIBERS: '/api/subscribers',

    // Company
    COMPANY: '/api/company',

    // AI
    AI: '/api/ai',
} as const;

// Route Paths
export const ROUTES = {
    HOME: '/',

    // Auth
    AUTH: {
        BASE: '/auth',
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY: '/auth/verify',
        FORGOT: '/auth/forgot',
    },

    // Dashboard
    DASHBOARD: {
        BASE: '/dashboard',
        HOME: '/dashboard/home',
        TOURS: '/dashboard/tours',
        ADD_TOUR: '/dashboard/tours/add_tour',
        EDIT_TOUR: (id: string) => `/dashboard/tours/edit_tour/${id}`,
        TOUR_SETTINGS: '/dashboard/tours/tour_setting',
        TOUR_CATEGORY: '/dashboard/tours/tour_category',
        TOUR_FACTS: '/dashboard/tours/tour_facts',
        TOUR_FAQ: '/dashboard/tours/tour_faq',
        TOUR_DESTINATION: '/dashboard/tours/tour_destination',
        TOUR_REVIEWS: '/dashboard/tours/reviews',
        POSTS: '/dashboard/posts',
        ADD_POST: '/dashboard/posts/add_post',
        EDIT_POST: (id: string) => `/dashboard/posts/edit_posts/${id}`,
        COMMENTS: '/dashboard/comments',
        USERS: '/dashboard/users',
        ADD_USER: '/dashboard/users/add_user',
        EDIT_USER: (id: string) => `/dashboard/users/${id}`,
        SELLER_APPLICATIONS: '/dashboard/users/seller-applications',
        SUBSCRIBERS: '/dashboard/subscribers',
        GALLERY: '/dashboard/gallery',
        SETTING: '/dashboard/setting',
    },

    // Frontend
    TOURS: '/tours',
    TOUR_DETAIL: (id: string) => `/tours/${id}`,
    TOUR_SEARCH: '/tours/search',
    DESTINATIONS: '/destinations',
    DESTINATION_DETAIL: (id: string) => `/destinations/${id}`,
    BLOG: '/blog',
    BLOG_POST: (id: string) => `/blog/${id}`,
    APPLY_SELLER: '/apply-seller',
} as const;

// React Query Keys
export const QUERY_KEYS = {
    // Tours
    TOURS: 'tours',
    TOUR: (id: string) => ['tour', id] as const,
    USER_TOURS: (userId: string) => ['user-tours', userId] as const,
    LATEST_TOURS: 'latest-tours',
    SEARCH_TOURS: (query: string) => ['search-tours', query] as const,

    // Reviews
    REVIEWS: 'reviews',
    TOUR_REVIEWS: (tourId: string) => ['tour-reviews', tourId] as const,
    PENDING_REVIEWS: 'pending-reviews',

    // Categories
    CATEGORIES: 'categories',
    USER_CATEGORIES: (userId: string) => ['user-categories', userId] as const,

    // Facts
    FACTS: 'facts',
    USER_FACTS: (userId: string) => ['user-facts', userId] as const,

    // FAQs
    FAQS: 'faqs',
    USER_FAQS: (userId: string) => ['user-faqs', userId] as const,

    // Posts
    POSTS: 'posts',
    POST: (id: string) => ['post', id] as const,

    // Comments
    COMMENTS: (postId: string) => ['comments', postId] as const,

    // Media
    MEDIA: 'media',

    // Destinations
    DESTINATIONS: 'destinations',
    DESTINATION: (id: string) => ['destination', id] as const,
    APPROVED_DESTINATIONS: 'approved-destinations',

    // Users
    USERS: 'users',
    USER: (id: string) => ['user', id] as const,
    SELLER_APPLICATIONS: 'seller-applications',

    // Subscribers
    SUBSCRIBERS: 'subscribers',

    // Settings
    TOUR_SETTINGS: 'tour-settings',
    USER_SETTINGS: (userId: string) => ['user-settings', userId] as const,

    // Company
    COMPANY: 'company',
} as const;

// Validation Rules
export const VALIDATION = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s-()]+$/,
    URL: /^https?:\/\/.+/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    TOURS_PER_PAGE: 12,
    POSTS_PER_PAGE: 10,
    COMMENTS_PER_PAGE: 20,
} as const;

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Tour Status
export const TOUR_STATUS = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
} as const;

// Review Status
export const REVIEW_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    SELLER: 'seller',
    USER: 'user',
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
    SUCCESS: {
        CREATED: 'Created successfully',
        UPDATED: 'Updated successfully',
        DELETED: 'Deleted successfully',
        SAVED: 'Saved successfully',
    },
    ERROR: {
        GENERIC: 'Something went wrong',
        NETWORK: 'Network error. Please check your connection',
        UNAUTHORIZED: 'You are not authorized to perform this action',
        NOT_FOUND: 'Resource not found',
    },
} as const;

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
    TIME: 'HH:mm',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token-store',
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar-state',
} as const;
