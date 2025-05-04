type UUID = string;
type Timestamptz = string;
type Json = any;

export interface Profile {
  id: UUID;
  created_at: Timestamptz;
  username: string | null;
  auth_id: UUID;
  profile_photo_media_id: UUID | null;
  is_youth: boolean;
  parent_profile_id: UUID | null;
  push_token: string | null;
  ghost_name: string | null;
}

export interface ProfileCreate {
  auth_id?: UUID;
  username?: string;
  profile_photo_media_id?: UUID;
  is_youth?: boolean;
  parent_profile_id?: UUID;
  ghost_name?: string;
}

export interface ProfileUpdate {
  username?: string | null;
  profile_photo_media_id?: UUID | null;
  ghost_name?: string | null;
}

export interface Post {
  id: UUID;
  created_at: Timestamptz;
  published: boolean;
  profile_id: UUID | null;
  description: string;
  media_id: UUID | null;
  captain_id: UUID | null;
}

export interface PostCreate {
  profile_id?: UUID;
  description: string;
  media_id?: UUID;
  captain_id?: UUID;
}

export interface PostUpdate {
  description?: string;
  published?: boolean;
}

export interface Media {
  id: UUID;
  created_at: Timestamptz;
  file_path: string;
  bucket: string;
  owner_auth_id: UUID | null;
  mime_type: string;
}

export interface MediaCreate {
  file_path: string;
  bucket: string;
  owner_auth_id?: UUID;
  mime_type: string;
}

export interface MediaUpdate {
  file_path?: string;
  bucket?: string;
  mime_type?: string;
}

export interface ProfileProduct {
  id: UUID;
  created_at: Timestamptz;
  product_id: UUID;
  profile_id: UUID;
  receipt_url: string;
}

export interface ProfileProductCreate {
  product_id: UUID;
  profile_id: UUID;
}

export interface ProfileProductUpdate {
  gifted?: boolean;
}

export interface Product {
  id: UUID;
  created_at: Timestamptz;
  owner_id: UUID;
  price_cents: number;
  stripe_price_id: string;
  product_type: string;
  sync_id: string;
}

export interface ProductCreate {
  price_cents: number;
  owner_id: UUID;
  stripe_price_id: string;
  product_type: string;
  sync_id: string;
}

export interface ProductUpdate {
  price_cents?: number;
  stripe_price_id?: string;
  product_type?: string;
}

export interface Submission {
  id: UUID;
  created_at: Timestamptz;
  longitude: number;
  latitude: number;
  fish_type: string;
  profile_id: UUID;
  note: string;
  media_id: UUID | null;
  fish_length: number;
  video_media_id: UUID | null;
  hero_media_id: UUID | null;
}

export interface SubmissionCreate {
  longitude: number;
  latitude: number;
  fish_type: string;
  profile_id?: UUID;
  note: string;
  media_id?: UUID;
  fish_length: number;
  video_media_id?: UUID;
  hero_media_id?: UUID;
}

export interface SubmissionUpdate {
  longitude?: number;
  latitude?: number;
  fish_type?: string;
  note?: string;
  media_id?: UUID;
  fish_length?: number;
  video_media_id?: UUID;
  hero_media_id?: UUID;
}

export interface RankboardSubmission {
  id: UUID;
  created_at: Timestamptz;
  rankboard_id: UUID;
  submission_id: UUID;
  verified: string;
  verifier_id: UUID | null;
}

export interface RankboardSubmissionCreate {
  rankboard_id: UUID;
  submission_id: UUID;
}

export interface RankboardSubmissionUpdate {
  verified: string;
}

export interface Rankboard {
  id: UUID;
  created_at: Timestamptz;
  is_main: boolean;
  derby_id: UUID | null;
  product_id: UUID | null;
  center_lat: number;
  center_long: number;
  radius: number;
  badge_requirements: Json;
  sync_id: string;
  species: string;
  sorter_type: string;
  metadata: Json;
  logo_media_id: UUID | null;
  type_: string;
  prizes: Json;
}

export interface RankboardCreate {
  is_main: boolean;
  derby_id?: UUID;
  product_id?: UUID;
  center_lat: number;
  center_long: number;
  radius: number;
  badge_requirements: Json;
  sync_id: string;
  species: string;
  sorter_type?: string;
  metadata?: Json;
  logo_media_id?: UUID;
  type_: string;
  prizes: Json;
}

export interface RankboardUpdate {
  is_main?: boolean;
  derby_id?: UUID;
  product_id?: UUID;
  center_lat?: number;
  center_long?: number;
  radius?: number;
  badge_requirements?: Json;
  sync_id?: string;
  species?: string;
  sorter_type?: string;
  metadata?: Json;
  logo_media_id?: UUID;
  type_?: string;
  prizes?: Json;
}

export interface RankboardRankings {
  id: UUID;
  created_at: Timestamptz;
  rankboard_id: UUID;
  orderd_submissions: string;
  ordered_submission_ids: string[];
}

export interface RankboardRankingsCreate {
  rankboard_id: UUID;
  ordered_submission_ids: string[];
}

export interface Badge {
  id: UUID;
  created_at: Timestamptz;
  title: string;
  description: string | null;
  badge_type: string;
  supply: number | null;
  media_id: UUID | null;
  captain_id: UUID | null;
  badge_schema: Json;
  hook_data: Json;
}

export interface BadgeCreate {
  title: string;
  description: string;
  badge_type: string;
  supply?: number;
  media_id?: UUID;
  captain_id?: UUID;
  badge_schema?: Json;
  hook_data?: Json;
}

export interface BadgeUpdate {
  title?: string;
  description?: string;
  badge_type?: string;
  supply?: number | null;
  media_id?: UUID | null;
  captain_id?: UUID | null;
  badge_schema?: Json;
  hook_data?: Json;
}

export interface BadgeAssignment {
  id: UUID;
  created_at: Timestamptz;
  badge_id: UUID;
  entity_id: UUID;
  entity_type: string;
  pinned: boolean;
  badge_data: Json;
}

export interface BadgeAssignmentCreate {
  badge_id: UUID;
  entity_id: UUID;
  entity_type: string;
  pinned?: boolean;
  badge_data?: Json;
}

export interface BadgeAssignmentUpdate {
  pinned?: boolean;
  badge_data?: Json;
}

export interface Stripe {
  id: UUID;
  created_at: Timestamptz;
  auth_id: UUID;
  account_id: string | null;
  onboarded: boolean;
  customer_id: string | null;
}

export interface StripeCreate {
  auth_id?: UUID;
  account_id?: string;
  customer_id?: string;
}

export interface StripeUpdate {
  account_id?: string;
  customer_id?: string;
  onboarded?: boolean;
}

export interface Wallet {
  id: UUID;
  created_at: Timestamptz;
  auth_id: UUID;
  balance: number;
}

export interface WalletCreate {
  auth_id?: UUID;
  balance: number;
}

export interface WalletUpdate {
  balance?: number;
}

export type FishTankEntry = Post | Submission;

export interface Captain {
  id: UUID;
  created_at: Timestamptz;
  auth_id: UUID;
  profile_id: UUID;
}

export interface CaptainCreate {
  profile_id: UUID;
}

export interface CaptainUpdate {
  profile_id?: UUID;
}

export interface Derby {
  id: UUID;
  created_at: Timestamptz;
  owner_id: UUID;
  product_id: UUID;
  captain_ids: Json;
  start_time: Timestamptz;
  end_time: Timestamptz;
  metadata: Json;
  logo_media_id: UUID | null;
  sync_id: string;
}

export interface DerbyCreate {
  product_id: UUID;
  captain_ids: UUID[];
  start_time: Timestamptz;
  end_time: Timestamptz;
  logo_media_id?: UUID;
  metadata?: Json;
  sync_id?: string;
  owner_id: UUID;
}

export interface DerbyUpdate {
  product_id?: UUID;
  captain_ids?: UUID[];
  start_time?: Timestamptz;
  end_time?: Timestamptz;
  logo_media_id?: UUID;
  metadata?: Json;
  sync_id?: string;
  owner_id?: UUID;
}

export interface Crew {
  id: UUID;
  created_at: Timestamptz;
  logo_media_id: UUID | null;
  name: string;
  owner_id: UUID | null;
  slogan: string | null;
}

export interface CrewProfile {
  id: UUID;
  created_at: Timestamptz;
  crew_id: UUID;
  profile_id: UUID;
  referer_profile_id: UUID | null;
}

export interface Payout {
  id: UUID;
  created_at: Timestamptz;
  rankboard_id: UUID;
  amount: number;
  profile_id: UUID;
}

export interface Like {
  id: UUID;
  created_at: Timestamptz;
  profile_id: UUID;
  post_id: UUID;
}

export interface LikeCreate {
  post_id: UUID;
}

export interface Comment {
  id: UUID;
  created_at: Timestamptz;
  profile_id: UUID;
  post_id: UUID;
  content: string;
}

export interface CommentCreate {
  post_id: UUID;
  content: string;
}

export interface CommentUpdate {
  content?: string;
}

export interface Identification {
  id: UUID;
  created_at: Timestamptz;
  profile_id: UUID;
  front_id_media_id: UUID;
  back_id_media_id: UUID;
  selfie_media_id: UUID;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  dl_number: string | null;
  sex: string | null;
  address: string | null;
  verified: boolean;
}

export interface IdentificationCreate {
  profile_id?: UUID;
  front_id_media_id: UUID;
  back_id_media_id: UUID;
  selfie_media_id: UUID;
  first_name?: string | null;
  last_name?: string | null;
  dob?: string | null;
  dl_number?: string | null;
  sex?: string | null;
  address?: string | null;
  verified: boolean;
}

export interface IdentificationUpdate {
  front_id_media_id?: UUID;
  back_id_media_id?: UUID;
  selfie_media_id?: UUID;
  first_name?: string | null;
  last_name?: string | null;
  dob?: string | null;
  dl_number?: string | null;
  sex?: string | null;
  address?: string | null;
  verified?: boolean;
}

export interface Message {
  id: UUID;
  created_at: Timestamptz;
  from: UUID;
  content: string;
}

export interface MessageCreate {
  from?: UUID;
  content: string;
}

export interface MessageUpdate {
  from?: UUID;
  content?: string;
}

export interface MessageRecipient {
  id: UUID;
  created_at: Timestamptz;
  message_id: UUID;
  profile_id: UUID;
  status: string;
}

export interface MessageRecipientCreate {
  message_id: UUID;
  profile_id: UUID;
  status: string;
}

export interface MessageRecipientUpdate {
  status: string;
}

export interface Sponsor {
  id: UUID;
  created_at: Timestamptz;
  name: string | null;
  website: string | null;
  logo_media_id: UUID | null;
  description: string | null;
  rankboard_id: UUID | null;
  sponsor_type: string;
}

export interface SponsorCreate {
  name: string;
  website?: string;
  logo_media_id?: UUID;
  description?: string;
  rankboard_id?: UUID;
  sponsor_type: string;
}

export interface SponsorUpdate {
  name?: string;
  website?: string;
  logo_media_id?: UUID;
  description?: string;
  rankboard_id?: UUID | null;
  sponsor_type?: string;
}

export interface Todo {
  id: UUID;
  created_at: Timestamptz;
  content: string;
  status: string;
  priority: string;
}

export interface TodoCreate {
  content: string;
  status: string;
  priority: string;
}

export interface TodoUpdate {
  content?: string;
  status?: string;
  priority?: string;
}

export interface TodoComment {
  id: UUID;
  created_at: Timestamptz;
  from: string;
  content: string;
  comment_id: UUID;
  todo_id: UUID;
}

export interface Youth {
  id: UUID;
  created_at: Timestamptz;
  username: string;
  parent_profile_id: UUID;
}

export interface YouthCreate {
  username: string;
  parent_profile_id: UUID;
}

export interface YouthUpdate {
  username?: string;
}

export interface SponsorProfile {
  id: UUID;
  created_at: Timestamptz;
  sponsor_id: UUID;
  profile_id: UUID;
}
export interface Request {
  id: UUID;
  path: string;
  method: string;
  ip_address: string;
  auth_id: UUID;
  user_agent: string;
  request_body: any;
  query_params: any;
  start_time: Timestamptz;
  end_time: Timestamptz;
  duration_ms: number;
  status_code: number;
  response_body: any;
  created_at: Timestamptz;
}