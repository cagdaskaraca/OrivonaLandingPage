export type UserRole = "Customer" | "Vendor" | "Admin";

export type AuthUser = {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  role?: string;
  roles?: string[];
};

export type AccountProfile = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  businessName?: string;
  description?: string;
  city?: string;
  district?: string;
  phone?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  isApproved?: boolean;
  preferredEventTypes?: string[] | string;
  budgetMin?: number;
  budgetMax?: number;
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  role?: string;
};

export type MarketplaceFilters = {
  city?: string;
  district?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  guestCount?: string;
  keyword?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
};

/** GET /services list envelope */
export interface ServicesListApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export type MarketplaceItem = {
  id?: string | number;
  vendorServiceId?: string | number;
  vendorId?: string | number;
  vendorName?: string;
  serviceTitle?: string;
  title?: string;
  description?: string;
  city?: string;
  district?: string;
  category?: string;
  price?: number;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  guestCapacity?: number;
  capacityMin?: number;
  capacityMax?: number;
  categoryName?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isFeatured?: boolean;
  isFavorite?: boolean;
  isVendorPremium?: boolean;
  createdAt?: string;
  badges?: string[];
  images?: ServiceGalleryImage[];
};

export type ServiceGalleryImage = {
  url?: string;
  imageUrl?: string;
  isCover?: boolean;
};

export type DashboardSummary = Record<string, number | string | undefined>;

export type FavoriteItem = {
  id?: string | number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  vendorName?: string;
  city?: string;
  district?: string;
  basePrice?: number;
  coverImageUrl?: string;
  categoryName?: string;
};

export type OfferRequest = {
  id?: string | number;
  offerId?: string | number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  vendorName?: string;
  customerName?: string;
  message?: string;
  guestCount?: number;
  eventDate?: string;
  status?: string;
  vendorOfferPrice?: number;
  vendorOfferDescription?: string;
  offeredPrice?: number;
  price?: number;
  responseDescription?: string;
  description?: string;
  validUntil?: string;
  createdAt?: string;
};

export type CreateOfferRequestPayload = {
  vendorServiceId: string | number;
  message: string;
  eventDate: string;
  guestCount: number;
};

export type SendVendorOfferPayload = {
  price: number;
  description: string;
  validUntil: string;
};

export type AcceptCustomerOfferPayload = {
  paymentMode: string;
  note: string;
};

export type RejectCustomerOfferPayload = {
  reason: string;
};

/** @deprecated Use sendVendorOffer */
export type RespondOfferPayload = SendVendorOfferPayload & {
  accept: boolean;
};

export type Reservation = {
  id?: string | number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  vendorName?: string;
  customerName?: string;
  eventDate?: string;
  guestCount?: number;
  totalPrice?: number;
  status?: string;
  notes?: string;
  createdAt?: string;
};

export type CreateReservationPayload = {
  vendorServiceId: string | number;
  eventDate: string;
  guestCount: number;
  notes?: string;
};

export type ServiceImage = {
  id?: string | number;
  url?: string;
  imageUrl?: string;
  isCover?: boolean;
  sortOrder?: number;
};

export type ServiceImagePayload = {
  url: string;
  isCover?: boolean;
  sortOrder?: number;
};

export type AiEventPlanRequest = {
  eventType: string;
  city: string;
  district: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  preferredCategories: string[];
};

export type AiBudgetLine = {
  categoryName?: string;
  category?: string;
  amount?: number;
  percentage?: number;
};

export type AiTimelineStep = {
  title?: string;
  description?: string;
  timing?: string;
};

export type AiEventPlanResult = {
  recommendations?: AiRecommendationItem[];
  budgetBreakdown?: AiBudgetLine[];
  timeline?: AiTimelineStep[];
  conceptIdeas?: string[];
  summary?: string;
};

export type AdminVendor = {
  id?: string | number;
  businessName?: string;
  ownerName?: string;
  email?: string;
  city?: string;
  district?: string;
  isApproved?: boolean;
  /** User account active (marketplace visibility when approved). */
  isUserActive?: boolean;
  rejectionReason?: string;
  status?: string;
  createdAt?: string;
};

export type AdminCategory = {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  serviceCount?: number;
};

export type AdminCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
};

export type AdminUser = {
  id?: string | number;
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
};

export type AdminService = {
  id?: string | number;
  title?: string;
  vendorName?: string;
  categoryName?: string;
  city?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  basePrice?: number;
};

export type AiRecommendationRequest = {
  eventType: string;
  city: string;
  district: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  preferredCategories: string[];
};

/** Single AI recommendation from POST /ai/recommendations */
export interface AiRecommendationItem {
  vendorName?: string;
  serviceTitle?: string;
  score?: number;
  estimatedPrice?: number;
  reasons?: string[] | string;
  vendorId?: string | number;
  serviceId?: string | number;
  vendorServiceId?: string | number;
}

/** @deprecated Use AiRecommendationItem */
export type AiRecommendation = AiRecommendationItem;

/** Backend envelope: { success, message, data: { recommendations } } */
export interface AiRecommendationsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    recommendations?: AiRecommendationItem[];
  };
}

/** GET /event-requests/my envelope */
export interface EventRequestsListApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export type EventRequest = {
  id?: string | number;
  title?: string;
  eventType?: string;
  eventDate?: string;
  city?: string;
  district?: string;
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
  notes?: string;
  description?: string;
  createdAt?: string;
};

/** GET/PUT /event-requests/{id} envelope */
export interface EventRequestApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export type EventRequestFormPayload = {
  title: string;
  eventType: string;
  eventDate: string;
  city: string;
  district: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  notes?: string;
  status?: string;
};

export type CreateEventRequestPayload = EventRequestFormPayload;

export type UpdateEventRequestPayload = EventRequestFormPayload;

/** Normalizes API payloads (camelCase or PascalCase) for event requests. */
export function normalizeEventRequest(item: unknown): EventRequest {
  if (!item || typeof item !== "object") {
    return {
      title: "",
      eventType: "",
      city: "",
      district: "",
      guestCount: 0,
      budgetMin: 0,
      budgetMax: 0,
      description: "",
      notes: "",
      status: "Draft",
    };
  }

  const o = item as Record<string, unknown>;
  const str = (camel: string, pascal: string, fallback = ""): string => {
    const v = o[camel] ?? o[pascal];
    return typeof v === "string" ? v : fallback;
  };
  const num = (camel: string, pascal: string, fallback = 0): number => {
    const v = o[camel] ?? o[pascal];
    return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  };
  const optionalStr = (camel: string, pascal: string): string | undefined => {
    const v = o[camel] ?? o[pascal];
    return typeof v === "string" ? v : undefined;
  };

  const description = str("description", "Description", "");
  const notesRaw = str("notes", "Notes", "");

  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    title: str("title", "Title", ""),
    eventType: str("eventType", "EventType", ""),
    eventDate: optionalStr("eventDate", "EventDate"),
    city: str("city", "City", ""),
    district: str("district", "District", ""),
    guestCount: num("guestCount", "GuestCount", 0),
    budgetMin: num("budgetMin", "BudgetMin", 0),
    budgetMax: num("budgetMax", "BudgetMax", 0),
    description,
    notes: notesRaw || description,
    status: str("status", "Status", "Draft"),
    createdAt: optionalStr("createdAt", "CreatedAt"),
  };
}

export interface ApiEnvelope {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export type Category = {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string;
};

export type VendorProfile = {
  id?: string | number;
  businessName?: string;
  description?: string;
  city?: string;
  district?: string;
  categories?: string[];
  rating?: number;
  isApproved?: boolean;
  isActive?: boolean;
};

export type VendorService = {
  id?: string | number;
  vendorId?: string | number;
  title?: string;
  description?: string;
  category?: string;
  categoryName?: string;
  categoryId?: string | number;
  basePrice?: number;
  price?: number;
  city?: string;
  district?: string;
  capacityMin?: number;
  capacityMax?: number;
  guestCapacity?: number;
  isActive?: boolean;
};

export type VendorServicePayload = {
  title: string;
  description: string;
  basePrice: number;
  city: string;
  district: string;
  capacityMin: number;
  capacityMax: number;
  isActive: boolean;
  categoryId: string | number;
  categoryName?: string;
};

/** MVP category names when GET /categories is unavailable */
export const VENDOR_CATEGORY_NAMES = [
  "Mekan",
  "Fotoğrafçı",
  "Catering",
  "Müzik",
  "Dekorasyon",
  "Organizasyon Planlayıcı",
  "Gelinlik",
  "Saç Makyaj",
  "Ulaşım",
  "Davetiye",
  "Pasta",
  "Nikah Şekeri",
] as const;

export type AdminSummary = {
  totalUsers?: number;
  totalCustomers?: number;
  totalVendors?: number;
  totalEventRequests?: number;
  pendingVendorApprovals?: number;
  [key: string]: number | string | undefined;
};

export type AppNotification = {
  id?: string | number;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  readAt?: string;
};

export type Conversation = {
  id?: string | number;
  vendorId?: string | number;
  vendorName?: string;
  customerId?: string | number;
  customerName?: string;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  updatedAt?: string;
  createdAt?: string;
};

export type ChatMessage = {
  id?: string | number;
  conversationId?: string | number;
  content?: string;
  senderId?: string | number;
  senderName?: string;
  senderRole?: string;
  isFromMe?: boolean;
  createdAt?: string;
};

export type CreateConversationPayload = {
  vendorServiceId: string | number;
  vendorId?: string | number;
  message?: string;
};

export type SendChatMessagePayload = {
  /** Trimmed before send; mapped to API field `messageText`. */
  message?: string;
  messageText?: string;
};

export type VendorAvailability = {
  id?: string | number;
  date?: string;
  isAvailable?: boolean;
  notes?: string;
  vendorServiceId?: string | number;
};

export type CreateVendorAvailabilityPayload = {
  date: string;
  isAvailable: boolean;
  notes?: string;
  vendorServiceId?: string | number;
};

export type ServiceReview = {
  id?: string | number;
  rating?: number;
  comment?: string;
  customerName?: string;
  authorName?: string;
  createdAt?: string;
};

export type ServiceReviewsData = {
  reviews: ServiceReview[];
  averageRating?: number;
  reviewCount?: number;
};

export type CreateServiceReviewPayload = {
  rating: number;
  comment: string;
};
