export type UserRole = "Customer" | "Vendor" | "Admin";

export type AuthUser = {
  id?: string;
  userId?: string;
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
  isSponsored?: boolean;
  promotionType?: string;
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

export type EventPlanPublicPagePayload = {
  title: string;
  description: string;
  dressCode: string;
  note: string;
  isPublished: boolean;
};

export type EventPlanPublicPage = {
  id?: string | number;
  eventPlanId?: string | number;
  slug?: string;
  publicSlug?: string;
  title?: string;
  description?: string;
  dressCode?: string;
  note?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicEventPageData = {
  title?: string;
  eventDate?: string;
  city?: string;
  district?: string;
  description?: string;
  dressCode?: string;
  note?: string;
  slug?: string;
};

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

export type InvitationEditorJson = {
  backgroundColor: string;
  title: string;
  description: string;
  dateText: string;
  textColor: string;
  fontSize: number;
  imageUrl?: string | null;
};

export type InvitationDesign = {
  id?: string | number;
  eventPlanId?: string | number;
  title?: string;
  status?: string;
  sourceType?: "Editor" | "Upload" | string;
  designJson?: InvitationEditorJson | string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  previewUrl?: string;
  /** API bazen previewImageUrl olarak döner */
  previewImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InvitationRevision = {
  id?: string | number;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  note?: string;
  createdAt?: string;
  uploadedBy?: string;
};

export type CreateInvitationDesignPayload = {
  title: string;
  sourceType: "Editor" | "Upload";
  status?: string;
  designJson?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
};

export type UpdateInvitationDesignPayload = Partial<CreateInvitationDesignPayload>;

export type PlaylistItem = {
  id?: string | number;
  eventPlanId?: string | number;
  trackTitle?: string;
  songTitle?: string;
  title?: string;
  artist?: string;
  link?: string;
  moment?: string;
  note?: string;
  createdAt?: string;
};

export type PlaylistItemFormPayload = {
  trackTitle: string;
  artist: string;
  link: string;
  moment: string;
  note?: string;
};

export type OfferRequest = {
  id?: string | number;
  offerId?: string | number;
  eventRequestId?: string | number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  vendorName?: string;
  customerName?: string;
  message?: string;
  guestCount?: number;
  eventDate?: string;
  status?: string;
  category?: string;
  eventPlanId?: string | number;
  vendorOfferPrice?: number;
  vendorOfferDescription?: string;
  offeredPrice?: number;
  price?: number;
  responseDescription?: string;
  description?: string;
  validUntil?: string;
  createdAt?: string;
  invitationDesign?: InvitationDesign;
  invitationRevisions?: InvitationRevision[];
  playlist?: PlaylistItem[];
};

export type CreateOfferRequestPayload = {
  vendorServiceId: string | number;
  message: string;
  eventDate: string;
  guestCount: number;
  /** Linked event plan; omit or null for standalone request. */
  eventPlanId?: string | number | null;
  category?: string;
  city?: string;
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
  /** Backend field name for request note. */
  note?: string;
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

export type AiPromptRequest = {
  prompt: string;
};

export type AiEventPlanRequest = AiPromptRequest;

export type AiMoodboardResult = {
  themeTitle?: string;
  colorPalette?: string[];
  decorationIdeas?: string[];
  musicIdeas?: string[];
  dressCodeIdeas?: string[];
  foodIdeas?: string[];
  photoStyleIdeas?: string[];
};

export type AiBudgetOptimizerResult = {
  currentTotal?: number;
  budget?: number;
  overBudget?: boolean;
  budgetWarning?: string;
  savingSuggestions?: string[];
  estimatedSavings?: number;
};

export type AiMissingServicesResult = {
  selectedCategories?: string[];
  missingCategories?: string[];
  recommendedNextSteps?: string[];
};

export type AiStyleMatchResult = {
  styleScore?: number;
  explanation?: string;
  matchedServices?: AiRecommendationItem[];
};

export type AiSimilarEventsResult = {
  averageBudget?: number;
  popularCategories?: string[];
  commonChecklist?: string[];
  insights?: string[];
};

export type AiDetectedEvent = {
  eventType?: string;
  city?: string;
  district?: string;
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  budget?: number;
  style?: string;
  theme?: string;
};

export type AiBudgetLine = {
  categoryName?: string;
  category?: string;
  amount?: number;
  estimatedMin?: number;
  estimatedMax?: number;
  suggestedBudget?: number;
  percentage?: number;
};

export type AiChecklistItem = {
  categoryName?: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
};

export type AiTimelineStep = {
  title?: string;
  description?: string;
  timing?: string;
  monthOffset?: number;
};

export type AiEventPlanResult = {
  summary?: string;
  detected?: AiDetectedEvent;
  eventType?: string;
  city?: string;
  district?: string;
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  style?: string;
  theme?: string;
  budgetBreakdown?: AiBudgetLine[];
  totalEstimatedMin?: number;
  totalEstimatedMax?: number;
  budgetStatus?: string;
  budgetWarning?: string;
  checklist?: AiChecklistItem[];
  timeline?: AiTimelineStep[];
  recommendations?: AiRecommendationItem[];
  aiTips?: string[];
  conceptIdeas?: string[];
};

export type AdminVendor = {
  id?: string | number;
  businessName?: string;
  legalBusinessName?: string;
  companyType?: string;
  taxNumber?: string;
  nationalId?: string;
  identityVerificationStatus?: string;
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
  categoryId?: string | number;
  city?: string;
  district?: string;
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

/** Single AI recommendation from event-plan or POST /ai/recommendations */
export interface AiRecommendationItem {
  vendorName?: string;
  serviceTitle?: string;
  title?: string;
  categoryName?: string;
  category?: string;
  city?: string;
  district?: string;
  price?: number;
  basePrice?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  score?: number;
  estimatedPrice?: number;
  reasons?: string[] | string;
  vendorId?: string | number;
  serviceId?: string | number;
  vendorServiceId?: string | number;
  coverImageUrl?: string;
  imageUrl?: string;
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
  eventPlanId?: string | number;
  invitationDesign?: InvitationDesign;
  invitationRevisions?: InvitationRevision[];
  playlist?: PlaylistItem[];
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
  type?: string;
  createdAt?: string;
  isRead?: boolean;
  readAt?: string;
  actionUrl?: string;
  /** Client-only row (not from API). */
  synthetic?: boolean;
};

export type Conversation = {
  id?: string | number;
  /** API-provided display name for the other participant in this thread. */
  otherPartyName?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorBusinessName?: string;
  businessName?: string;
  customerId?: string | number;
  customerName?: string;
  customerFullName?: string;
  customerEmail?: string;
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
  senderUserId?: string | number;
  senderId?: string | number;
  userId?: string | number;
  senderName?: string;
  senderFullName?: string;
  otherPartyName?: string;
  senderEmail?: string;
  senderBusinessName?: string;
  customerName?: string;
  customerFullName?: string;
  customerEmail?: string;
  vendorName?: string;
  vendorBusinessName?: string;
  businessName?: string;
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

export type AvailabilityTimeSlotPayload = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status?: string;
};

export type VendorAvailability = {
  id?: string | number;
  date?: string;
  isAvailable?: boolean;
  status?: string;
  notes?: string;
  vendorServiceId?: string | number;
  timeSlots?: AvailabilityTimeSlotPayload[];
};

export type CreateVendorAvailabilityPayload = {
  date: string;
  isAvailable: boolean;
  status?: string;
  notes?: string;
  vendorServiceId?: string | number;
  timeSlots?: AvailabilityTimeSlotPayload[];
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

/** Vendor CRM lead */
export type VendorLeadStatus =
  | "New"
  | "Contacted"
  | "OfferSent"
  | "Won"
  | "Lost"
  | string;

export type VendorLead = {
  id?: string | number;
  customerName?: string;
  customerEmail?: string;
  serviceTitle?: string;
  serviceId?: string | number;
  vendorServiceId?: string | number;
  status?: VendorLeadStatus;
  score?: number;
  lastActivityAt?: string;
  lastActivity?: string;
  notes?: string;
  note?: string;
  createdAt?: string;
};

export type VendorAnalyticsSummary = {
  totalViews?: number;
  totalMessages?: number;
  totalOffers?: number;
  reservations?: number;
  totalReservations?: number;
  conversionRate?: number;
  estimatedRevenue?: number;
  averageResponseTime?: string;
  averageResponseTimeMinutes?: number;
};

export type VendorServicePerformance = {
  serviceId?: string | number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  title?: string;
  views?: number;
  messages?: number;
  offers?: number;
  conversionRate?: number;
};

export type VendorLeadFunnelStage = {
  status?: string;
  count?: number;
  label?: string;
};

export type VendorMonthlyAnalytics = {
  month?: string;
  year?: number;
  views?: number;
  messages?: number;
  offers?: number;
  reservations?: number;
  revenue?: number;
};

export type ReviewIntelligenceSummary = {
  aiSummary?: string;
  summary?: string;
  positives?: string[];
  strengths?: string[];
  improvements?: string[];
  areasToImprove?: string[];
};

/** Smart Event OS — customer event plans */
export type EventTaskStatus = "Todo" | "InProgress" | "Done" | "Skipped";

export type EventPlan = {
  id?: string | number;
  title?: string;
  eventType?: string;
  eventDate?: string;
  city?: string;
  district?: string;
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  status?: string;
  progressPercent?: number;
  createdAt?: string;
};

export type EventPlanFormPayload = {
  title: string;
  eventType: string;
  eventDate: string;
  city: string;
  district: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  notes?: string;
};

export type EventTask = {
  id?: string | number;
  title?: string;
  description?: string;
  status?: string;
  categoryName?: string;
  priority?: string;
  dueDate?: string;
  sortOrder?: number;
};

export type EventTaskFormPayload = {
  title: string;
  description?: string;
  status?: EventTaskStatus;
  categoryName?: string;
  priority?: string;
  dueDate?: string;
};

/** POST /event-plans/{eventPlanId}/checklist/items — manuel madde */
export type ChecklistItemFormPayload = {
  title: string;
  category?: string | null;
  note?: string | null;
  dueDate?: string | null;
};

/** Kabul edilmiş teklif — GET /event-plans/{id}/agreements */
export type CustomerAgreement = {
  id?: string | number;
  eventPlanId?: string | number;
  category?: string;
  categoryName?: string;
  serviceType?: string;
  vendorId?: string | number | null;
  vendorName?: string;
  agreedPrice?: number;
  agreementDate?: string;
  note?: string;
  status?: string;
};

export type EventPlanBudgetLine = {
  id?: string | number;
  category?: string;
  categoryName?: string;
  serviceType?: string;
  vendorName?: string;
  agreedPrice?: number;
  amount?: number;
  agreementDate?: string;
  note?: string;
};

export type EventPlanBudgetSummary = {
  eventPlanId?: string | number;
  totalBudget?: number;
  spentBudget?: number;
  totalSpent?: number;
  remainingBudget?: number;
  items?: EventPlanBudgetLine[];
  lines?: EventPlanBudgetLine[];
};

export type EventGuest = {
  id?: string | number;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  groupName?: string;
  group?: string;
  rsvpStatus?: string;
  plusOneCount?: number;
  tableId?: string | number;
  tableName?: string;
  note?: string;
  notes?: string;
  inviteSent?: boolean;
  isInviteSent?: boolean;
  ticketSent?: boolean;
  isTicketSent?: boolean;
  respondedAt?: string;
  rsvpRespondedAt?: string;
};

export type InviteDetails = {
  token?: string;
  eventTitle?: string;
  guestName?: string;
  hostName?: string;
  eventDate?: string;
  eventLocation?: string;
  city?: string;
  district?: string;
  customMessage?: string;
  message?: string;
  plusOneAllowed?: boolean;
  maxPlusOne?: number;
  allowPlusOne?: boolean;
  rsvpStatus?: string;
  alreadyResponded?: boolean;
  hasResponded?: boolean;
};

export type InviteTicket = {
  eventTitle?: string;
  guestName?: string;
  ticketCode?: string;
  plusOneCount?: number;
  qrText?: string;
  qrCodeUrl?: string;
  qrImageUrl?: string;
};

export type SendInvitePayload = {
  message?: string;
  customMessage?: string;
};

export type SendInviteResult = {
  demoMode?: boolean;
  inviteUrl?: string;
  message?: string;
};

export type SendInvitesBulkPayload = {
  guestIds: (string | number)[];
  message?: string;
  customMessage?: string;
};

export type PublicInviteRsvpPayload = {
  rsvpStatus: "Accepted" | "Declined" | "Maybe";
  plusOneCount?: number;
  note?: string;
};

export type EventGuestFormPayload = {
  fullName: string;
  email?: string;
  phone?: string;
  groupName?: string;
  note?: string;
  rsvpStatus?: string;
  plusOneCount?: number;
};

export type RsvpSummary = {
  total?: number;
  attending?: number;
  notAttending?: number;
  maybe?: number;
  pending?: number;
};

export type SeatingTable = {
  id?: string | number;
  name?: string;
  capacity?: number;
  assignedGuestIds?: (string | number)[];
  guests?: EventGuest[];
};

export type SeatingTableFormPayload = {
  name: string;
  capacity: number;
};

export type TablePlanTableType =
  | "Square4"
  | "Rectangle6"
  | "Rectangle8"
  | "Round6"
  | "Round8"
  | "Round10"
  | "Stage"
  | "DanceFloor"
  | "CustomArea";

export type TablePlanSeat = {
  id?: string | number;
  seatNumber?: number;
  guestId?: string | number | null;
  guestName?: string | null;
};

export type TablePlanTable = {
  id?: string | number;
  name?: string;
  tableType?: TablePlanTableType | string;
  capacity?: number;
  occupiedCount?: number;
  emptyCount?: number;
  positionX?: number;
  positionY?: number;
  rotation?: number;
  seats?: TablePlanSeat[];
};

export type TablePlanGuest = {
  id?: string | number;
  fullName?: string;
  assignedTableId?: string | number | null;
  assignedTableName?: string | null;
  assignedSeatId?: string | number | null;
  assignedSeatNumber?: number | null;
  isAssigned?: boolean;
};

export type TablePlanData = {
  eventPlanId?: string | number;
  tables?: TablePlanTable[];
  guests?: TablePlanGuest[];
};

export type CreateTablePayload = {
  name: string;
  tableType: TablePlanTableType;
  positionX: number;
  positionY: number;
  rotation?: number;
};

export type UpdateTablePayload = {
  name: string;
  positionX: number;
  positionY: number;
  rotation?: number;
};

export type EventPlanBoardItem = {
  id?: string | number;
  type?: string;
  title?: string;
  category?: string;
  description?: string;
  vendorName?: string | null;
  price?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
};

export type EventPlanBoardColumn = {
  key?: string;
  title?: string;
  count?: number;
  items?: EventPlanBoardItem[];
};

export type EventPlanBoardData = {
  eventPlanId?: string | number;
  columns?: EventPlanBoardColumn[];
};

export type EventReminder = {
  id?: string | number;
  title?: string;
  message?: string;
  description?: string;
  dueDate?: string;
  scheduledAt?: string;
  type?: string;
  channel?: string;
};

export type QrInvite = {
  inviteUrl?: string;
  qrCodeUrl?: string;
  message?: string;
  demoText?: string;
};

export type PublicEventInvite = {
  token?: string;
  inviteUrl?: string;
  welcomeMessage?: string;
  isActive?: boolean;
  disabled?: boolean;
};

export type EventInviteInfo = {
  token?: string;
  eventTitle?: string;
  eventType?: string;
  eventDate?: string;
  city?: string;
  district?: string;
  eventLocation?: string;
  hostName?: string;
  welcomeMessage?: string;
  message?: string;
  plusOneAllowed?: boolean;
  maxPlusOne?: number;
  isActive?: boolean;
};

export type VerifyGuestPayload = {
  fullName: string;
  phone?: string;
  email?: string;
};

export type VerifyGuestResult = {
  matched?: boolean;
  guestAccessToken?: string;
  guestName?: string;
  maskedName?: string;
  maskedPhone?: string;
  maskedEmail?: string;
  requiresEmail?: boolean;
  requiresPhone?: boolean;
  multipleMatches?: boolean;
  rsvpStatus?: string;
  alreadyResponded?: boolean;
};

export type EventInviteRsvpPayload = {
  guestAccessToken: string;
  rsvpStatus: "Accepted" | "Declined" | "Maybe";
  plusOneCount?: number;
  note?: string;
};
