/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Families = "families",
	Geofences = "geofences",
	ListItems = "list_items",
	Lists = "lists",
	LocationHistory = "location_history",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type FamiliesRecord = {
	created: IsoAutoDateString
	created_by: RecordIdString
	id: string
	invite_code: string
	name: string
	ntfy_topic_prefix: string
	updated: IsoAutoDateString
}

export enum GeofencesTriggerOnOptions {
	"enter" = "enter",
	"exit" = "exit",
	"both" = "both",
}
export type GeofencesRecord = {
	created: IsoAutoDateString
	enabled?: boolean
	family_id: RecordIdString
	id: string
	lat?: number
	lng?: number
	name: string
	notify_user_id?: RecordIdString
	radius?: number
	trigger_on?: GeofencesTriggerOnOptions
	updated: IsoAutoDateString
	watch_user_id?: RecordIdString
}

export type ListItemsRecord = {
	checked?: boolean
	checked_by?: RecordIdString
	created: IsoAutoDateString
	created_by?: RecordIdString
	id: string
	list_id: RecordIdString
	name: string
	note?: string
	quantity?: string
	sort_order?: number
	updated: IsoAutoDateString
}

export enum ListsStatusOptions {
	"active" = "active",
	"completed" = "completed",
	"archived" = "archived",
}

export enum ListsTypeOptions {
	"shopping" = "shopping",
	"todo" = "todo",
	"packing" = "packing",
	"custom" = "custom",
}
export type ListsRecord = {
	assigned_to?: RecordIdString
	created: IsoAutoDateString
	created_by?: RecordIdString
	family_id: RecordIdString
	id: string
	name: string
	sort_order?: number
	status?: ListsStatusOptions
	type: ListsTypeOptions
	updated: IsoAutoDateString
}

export type LocationHistoryRecord = {
	accuracy?: number
	battery_level?: number
	created: IsoAutoDateString
	id: string
	lat?: number
	lng?: number
	timestamp?: IsoDateString
	updated: IsoAutoDateString
	user_id: RecordIdString
}

export enum UsersRoleOptions {
	"admin" = "admin",
	"member" = "member",
	"child" = "child",
}

export enum UsersLocationSharingModeOptions {
	"off" = "off",
	"always" = "always",
	"timed" = "timed",
	"on_request" = "on_request",
}
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	family_id?: RecordIdString
	id: string
	last_lat?: number
	last_lng?: number
	last_location_at?: IsoDateString
	location_sharing_mode?: UsersLocationSharingModeOptions
	location_sharing_until?: IsoDateString
	name?: string
	password: string
	role: UsersRoleOptions
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type FamiliesResponse<Texpand = unknown> = Required<FamiliesRecord> & BaseSystemFields<Texpand>
export type GeofencesResponse<Texpand = unknown> = Required<GeofencesRecord> & BaseSystemFields<Texpand>
export type ListItemsResponse<Texpand = unknown> = Required<ListItemsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type LocationHistoryResponse<Texpand = unknown> = Required<LocationHistoryRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	families: FamiliesRecord
	geofences: GeofencesRecord
	list_items: ListItemsRecord
	lists: ListsRecord
	location_history: LocationHistoryRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	families: FamiliesResponse
	geofences: GeofencesResponse
	list_items: ListItemsResponse
	lists: ListsResponse
	location_history: LocationHistoryResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
