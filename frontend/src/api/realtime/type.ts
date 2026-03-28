export type TripRealtimeScope =
  | 'HEADER'
  | 'RESERVATIONS'
  | 'WISHLIST'
  | 'DAILY_PLANS'
  | 'BUDGET'
  | 'CHECKLIST'
  | 'TRIP_VERSION';

export type TripRealtimeSection =
  | 'OVERVIEW_RESERVATIONS'
  | 'OVERVIEW_WISHLIST'
  | 'DAILY_PLAN'
  | 'CHECKLIST';

export type TripRealtimeResourceType = 'RESERVATION' | 'WISHLIST_PLACE' | 'SCHEDULED_PLACE' | 'CHECKLIST_ITEM';

export type TripRealtimeLockPurpose = 'EDIT' | 'DELETE' | 'REORDER';

export type TripRealtimeUser = {
  id: number;
  username: string;
  profilePicUrl: string | null;
};

export type TripRealtimeLock = {
  tripId: number;
  section: TripRealtimeSection;
  resourceType: TripRealtimeResourceType;
  resourceId: number;
  planId: number | null;
  purpose: TripRealtimeLockPurpose;
  owner: TripRealtimeUser;
  acquiredAt: string;
  expiresAt: string;
};

export type TripRealtimeAddPresence = {
  tripId: number;
  section: TripRealtimeSection;
  planId: number | null;
  user: TripRealtimeUser;
  updatedAt: string;
};

export type TripRealtimeSnapshot = {
  locks: TripRealtimeLock[];
  addPresence: TripRealtimeAddPresence[];
};

export type TripRealtimeHello = {
  serverTime: string;
  connectionId: string;
  user: TripRealtimeUser;
};

export type TripRealtimeDataChanged = {
  tripId: number;
  scopes: TripRealtimeScope[];
  at: string;
};

export type TripRealtimeKeepalive = {
  at: string;
};

export type TripRealtimeAcquireLockRequest = {
  resourceType: TripRealtimeResourceType;
  resourceId: number;
  planId?: number;
  purpose: TripRealtimeLockPurpose;
};

export type TripRealtimeLockKeyRequest = {
  resourceType: TripRealtimeResourceType;
  resourceId: number;
};

export type AcquireLockResult =
  | { status: 'acquired'; lock: TripRealtimeLock }
  | { status: 'conflict'; lock: TripRealtimeLock };

export type RenewLockResult =
  | { status: 'renewed'; lock: TripRealtimeLock }
  | { status: 'conflict'; lock: TripRealtimeLock }
  | { status: 'not_found' };

export type ReleaseLockResult =
  | { status: 'released' }
  | { status: 'forbidden' }
  | { status: 'not_found' };
