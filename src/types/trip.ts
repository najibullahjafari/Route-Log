export type TripStop = {
    type: string;
    details: string;
    timestamp: string | null;
};

export type RouteLeg = {
    segment: number;
    distance_miles: number;
    duration_hours: number;
};

export type RouteSummary = {
    distance_miles: number;
    duration_hours: number;
    legs: RouteLeg[];
    stops: TripStop[];
    fallback_route?: boolean;
    geocoding: GeocodingNote[];
};

export type HosEntry = {
    activity: string;
    status: string;
    start: string;
    end: string;
    duration_hours: number;
};

export type HosDayLog = {
    day: number;
    start: string;
    entries: HosEntry[];
};

export type MapMarker = {
    label: string;
    latitude: number;
    longitude: number;
    approximate?: boolean;
};

export type MapData = {
    polyline: [number, number][];
    markers: MapMarker[];
};

export type GeocodingNote = {
    query: string;
    display_name: string;
    approximate: boolean;
};

export type TripResponse = {
    id: number;
    created_by: string | null;
    current_location: string;
    pickup_location: string;
    dropoff_location: string;
    current_cycle_used: string;
    route_summary: RouteSummary;
    hos_logs: HosDayLog[];
    map_data: MapData;
    created_at: string;
    updated_at: string;
};

export type TripRequestPayload = {
    current_location: string;
    pickup_location: string;
    dropoff_location: string;
    current_cycle_used: number;
};
