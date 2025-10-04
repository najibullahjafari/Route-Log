import hashlib
import logging
import math
from datetime import timedelta
from typing import Dict, List, Optional

import requests
from django.utils import timezone
from geopy.distance import geodesic
from geopy.exc import GeocoderServiceError, GeocoderTimedOut, GeocoderUnavailable
from geopy.extra.rate_limiter import RateLimiter
from geopy.geocoders import Nominatim

# the constrants below are based on US FMCSA regulations for property-carrying drivers
AVERAGE_SPEED_MPH = 55
MAX_DRIVING_HOURS_PER_DAY = 11
MAX_ON_DUTY_HOURS_PER_DAY = 14
BREAK_TRIGGER_DRIVING_HOURS = 8
BREAK_DURATION_HOURS = 0.5
SLEEPER_BERTH_HOURS = 10
PICKUP_DURATION_HOURS = 1
DROPOFF_DURATION_HOURS = 1
FUELING_INTERVAL_MILES = 1000
FUELING_DURATION_HOURS = 1
CYCLE_LIMIT_HOURS = 70

logger = logging.getLogger(__name__)

_geolocator = Nominatim(user_agent="RouteLogPro/1.0", timeout=10)
_geocode = RateLimiter(_geolocator.geocode, min_delay_seconds=1, max_retries=3)


def _approximate_location(query: str) -> Dict:
    digest = hashlib.sha256(query.lower().encode("utf-8")).digest()
    lat_seed = int.from_bytes(digest[:4], "big") / 0xFFFFFFFF
    lon_seed = int.from_bytes(digest[4:8], "big") / 0xFFFFFFFF

    # Generate coordinates anywhere in the world
    latitude = -90 + lat_seed * 180  # -90 to 90
    longitude = -180 + lon_seed * 360  # -180 to 180

    return {
        "query": query,
        "latitude": round(latitude, 6),
        "longitude": round(longitude, 6),
        "display_name": f"{query} (approximate)",
        "approximate": True,
    }


def _geocode_location(query: str) -> Dict:
    # Check if this is already a coordinate string from map selection
    import re
    coord_match = re.search(r'Pinned location \((-?\d+\.\d+),\s*(-?\d+\.\d+)\)', query)
    if coord_match:
        lat = float(coord_match.group(1))
        lng = float(coord_match.group(2))
        return {
            "query": query,
            "latitude": lat,
            "longitude": lng,
            "display_name": f"Pinned location ({lat:.4f}, {lng:.4f})",
            "approximate": False,
        }

    try:
        location = _geocode(query)
    except (GeocoderTimedOut, GeocoderUnavailable, GeocoderServiceError, requests.RequestException) as exc:
        logger.warning("Geocoder unavailable for '%s': %s", query, exc)
        return _approximate_location(query)
    except Exception as exc:  # unexpected geocoder errors
        logger.warning("Unexpected geocoding error for '%s': %s", query, exc)
        return _approximate_location(query)

    if not location:
        logger.info(
            "No geocoding result for '%s'; using approximate coordinates", query)
        return _approximate_location(query)

    return {
        "query": query,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "display_name": location.address,
        "approximate": False,
    }


def _fallback_route(points: List[Dict]) -> Dict:
    total_distance = 0.0
    legs_summary = []
    for index in range(len(points) - 1):
        start = (points[index]["latitude"], points[index]["longitude"])
        end = (points[index + 1]["latitude"], points[index + 1]["longitude"])
        distance_miles = geodesic(start, end).miles
        total_distance += distance_miles
        legs_summary.append(
            {
                "segment": index + 1,
                "distance_miles": round(distance_miles, 2),
                "duration_hours": round(distance_miles / AVERAGE_SPEED_MPH, 2),
            }
        )
    duration_hours = total_distance / AVERAGE_SPEED_MPH if total_distance else 0
    return {
        "distance_miles": round(total_distance, 2),
        "duration_hours": round(duration_hours, 2),
        "polyline": [[point["latitude"], point["longitude"]] for point in points],
        "legs": legs_summary,
        "fallback": True,
    }


def _fetch_route(points: List[Dict]) -> Dict:
    if len(points) < 2:
        raise ValueError(
            "At least two locations are required to build a route.")

    coordinates = ";".join(
        f"{point['longitude']},{point['latitude']}" for point in points
    )
    url = f"https://router.project-osrm.org/route/v1/driving/{coordinates}"
    params = {"overview": "full", "geometries": "geojson", "steps": "false"}

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
    except (requests.RequestException, ValueError):
        return _fallback_route(points)

    payload = response.json()
    routes = payload.get("routes")
    if not routes:
        return _fallback_route(points)

    route = routes[0]
    geometry = route.get("geometry", {}).get("coordinates", [])
    legs = route.get("legs", [])

    legs_summary = []
    for index, leg in enumerate(legs):
        legs_summary.append(
            {
                "segment": index + 1,
                "distance_miles": round(leg["distance"] / 1609.34, 2),
                "duration_hours": round(leg["duration"] / 3600, 2),
            }
        )

    return {
        "distance_miles": round(route["distance"] / 1609.34, 2),
        "duration_hours": round(route["duration"] / 3600, 2),
        "polyline": [[lat, lon] for lon, lat in geometry] if geometry else [
            [point["latitude"], point["longitude"]] for point in points
        ],
        "legs": legs_summary,
        "fallback": False,
    }


def _generate_hos_plan(distance_miles: float, cycle_used: float) -> Dict:
    cycle_total = float(cycle_used)
    initial_cycle = cycle_total
    if cycle_total >= CYCLE_LIMIT_HOURS:
        raise ValueError("Driver has no remaining cycle hours available.")

    start_of_day = timezone.now().replace(hour=8, minute=0, second=0, microsecond=0)
    distance_remaining = distance_miles
    logs = []
    stops: List[Dict] = []
    distance_since_fuel = 0.0
    fueling_index = 1
    pickup_timestamp: Optional[str] = None
    dropoff_timestamp: Optional[str] = None
    total_on_duty_hours = 0.0
    completion_time = start_of_day

    day_index = 1
    limit_reached = False
    pickup_recorded = False

    while distance_remaining > 0:
        if cycle_total >= CYCLE_LIMIT_HOURS:
            limit_reached = True
            break

        day_start = start_of_day + timedelta(days=day_index - 1)
        current_time = day_start
        day_entries: List[Dict] = []
        driving_today = 0.0
        on_duty_today = 0.0
        hours_since_break = 0.0

        # Pre-trip inspection
        pretrip_hours = min(0.5, CYCLE_LIMIT_HOURS - cycle_total)
        if pretrip_hours <= 0:
            limit_reached = True
            break
        day_entries.append(
            {
                "activity": "Pre-Trip Inspection",
                "status": "On Duty",
                "start": current_time.isoformat(),
                "end": (current_time + timedelta(hours=pretrip_hours)).isoformat(),
                "duration_hours": round(pretrip_hours, 2),
            }
        )
        current_time += timedelta(hours=pretrip_hours)
        on_duty_today += pretrip_hours
        cycle_total += pretrip_hours
        total_on_duty_hours += pretrip_hours
        completion_time = current_time

        if not pickup_recorded:
            pickup_hours = min(PICKUP_DURATION_HOURS,
                               CYCLE_LIMIT_HOURS - cycle_total)
            if pickup_hours <= 0:
                limit_reached = True
                break
            pickup_entry = {
                "activity": "Pickup Service",
                "status": "On Duty",
                "start": current_time.isoformat(),
                "end": (current_time + timedelta(hours=pickup_hours)).isoformat(),
                "duration_hours": round(pickup_hours, 2),
            }
            day_entries.append(pickup_entry)
            pickup_timestamp = pickup_entry["end"]
            current_time += timedelta(hours=pickup_hours)
            on_duty_today += pickup_hours
            cycle_total += pickup_hours
            total_on_duty_hours += pickup_hours
            completion_time = current_time
            pickup_recorded = True
            stops.append(
                {
                    "type": "Pickup",
                    "details": "Pickup service completed",
                    "timestamp": pickup_timestamp,
                }
            )

        while distance_remaining > 0 and cycle_total < CYCLE_LIMIT_HOURS:
            if (
                driving_today >= MAX_DRIVING_HOURS_PER_DAY
                or on_duty_today >= MAX_ON_DUTY_HOURS_PER_DAY
            ):
                break

            break_limit = BREAK_TRIGGER_DRIVING_HOURS - hours_since_break
            drive_capacity = min(
                MAX_DRIVING_HOURS_PER_DAY - driving_today,
                MAX_ON_DUTY_HOURS_PER_DAY - on_duty_today,
                CYCLE_LIMIT_HOURS - cycle_total,
                break_limit,
            )

            distance_hours_possible = distance_remaining / AVERAGE_SPEED_MPH
            drive_hours = min(drive_capacity, distance_hours_possible)

            if drive_hours <= 0:
                if (
                    hours_since_break >= BREAK_TRIGGER_DRIVING_HOURS
                    and on_duty_today < MAX_ON_DUTY_HOURS_PER_DAY
                ):
                    break_entry = {
                        "activity": "30-Minute Break",
                        "status": "Off Duty",
                        "start": current_time.isoformat(),
                        "end": (current_time + timedelta(hours=BREAK_DURATION_HOURS)).isoformat(),
                        "duration_hours": BREAK_DURATION_HOURS,
                    }
                    day_entries.append(break_entry)
                    current_time += timedelta(hours=BREAK_DURATION_HOURS)
                    hours_since_break = 0.0
                    completion_time = current_time
                    continue
                break

            distance_chunk = drive_hours * AVERAGE_SPEED_MPH
            drive_entry = {
                "activity": "Driving",
                "status": "Driving",
                "start": current_time.isoformat(),
                "end": (current_time + timedelta(hours=drive_hours)).isoformat(),
                "duration_hours": round(drive_hours, 2),
            }
            day_entries.append(drive_entry)
            current_time += timedelta(hours=drive_hours)
            driving_today += drive_hours
            on_duty_today += drive_hours
            hours_since_break += drive_hours
            cycle_total += drive_hours
            total_on_duty_hours += drive_hours
            distance_remaining -= distance_chunk
            distance_since_fuel += distance_chunk
            completion_time = current_time

            if distance_remaining <= 0:
                break

            if distance_since_fuel >= FUELING_INTERVAL_MILES:
                if cycle_total + FUELING_DURATION_HOURS > CYCLE_LIMIT_HOURS:
                    limit_reached = True
                    break
                fuel_entry = {
                    "activity": "Fueling",
                    "status": "On Duty",
                    "start": current_time.isoformat(),
                    "end": (current_time + timedelta(hours=FUELING_DURATION_HOURS)).isoformat(),
                    "duration_hours": FUELING_DURATION_HOURS,
                }
                day_entries.append(fuel_entry)
                current_time += timedelta(hours=FUELING_DURATION_HOURS)
                on_duty_today += FUELING_DURATION_HOURS
                cycle_total += FUELING_DURATION_HOURS
                total_on_duty_hours += FUELING_DURATION_HOURS
                completion_time = current_time
                stops.append(
                    {
                        "type": "Fuel Stop",
                        "details": f"Fuel stop {fueling_index}",
                        "timestamp": fuel_entry["end"],
                    }
                )
                fueling_index += 1
                distance_since_fuel = 0.0

            if cycle_total >= CYCLE_LIMIT_HOURS:
                limit_reached = True
                break

        day_completed = False
        if distance_remaining <= 0:
            if cycle_total + DROPOFF_DURATION_HOURS <= CYCLE_LIMIT_HOURS:
                drop_entry = {
                    "activity": "Dropoff Service",
                    "status": "On Duty",
                    "start": current_time.isoformat(),
                    "end": (current_time + timedelta(hours=DROPOFF_DURATION_HOURS)).isoformat(),
                    "duration_hours": DROPOFF_DURATION_HOURS,
                }
                day_entries.append(drop_entry)
                current_time += timedelta(hours=DROPOFF_DURATION_HOURS)
                dropoff_timestamp = drop_entry["end"]
                on_duty_today += DROPOFF_DURATION_HOURS
                cycle_total += DROPOFF_DURATION_HOURS
                total_on_duty_hours += DROPOFF_DURATION_HOURS
                completion_time = current_time
                stops.append(
                    {
                        "type": "Dropoff",
                        "details": "Dropoff service completed",
                        "timestamp": dropoff_timestamp,
                    }
                )
            day_completed = True
        elif cycle_total < CYCLE_LIMIT_HOURS:
            sleeper_entry = {
                "activity": "Sleeper Berth",
                "status": "Off Duty",
                "start": current_time.isoformat(),
                "end": (current_time + timedelta(hours=SLEEPER_BERTH_HOURS)).isoformat(),
                "duration_hours": SLEEPER_BERTH_HOURS,
            }
            day_entries.append(sleeper_entry)
            current_time += timedelta(hours=SLEEPER_BERTH_HOURS)
            completion_time = current_time
            stops.append(
                {
                    "type": "Rest",
                    "details": f"Day {day_index} 10-hour rest",
                    "timestamp": sleeper_entry["start"],
                }
            )
            day_completed = True
        else:
            limit_reached = True

        if day_entries:
            logs.append(
                {
                    "day": day_index,
                    "start": day_start.isoformat(),
                    "entries": day_entries,
                }
            )

        if distance_remaining <= 0 or limit_reached:
            break

        day_index += 1

    summary = {
        "total_distance_miles": round(distance_miles, 2),
        "estimated_drive_hours": round(distance_miles / AVERAGE_SPEED_MPH, 2),
        "days_planned": len(logs),
        "cycle_hours_start": round(initial_cycle, 2),
        "cycle_hours_consumed": round(max(cycle_total - initial_cycle, 0), 2),
        "cycle_limit_reached": limit_reached,
        "remaining_distance_miles": round(max(distance_remaining, 0), 2),
        "estimated_completion": completion_time.isoformat(),
    }

    return {
        "summary": summary,
        "logs": logs,
        "stops": stops,
        "pickup_timestamp": pickup_timestamp,
        "dropoff_timestamp": dropoff_timestamp,
    }


def build_trip_plan(trip) -> Dict:
    origin = _geocode_location(trip.current_location)
    pickup = _geocode_location(trip.pickup_location)
    dropoff = _geocode_location(trip.dropoff_location)

    points = [origin, pickup, dropoff]
    route = _fetch_route(points)

    geocoding_notes = [
        {
            "query": location["query"],
            "display_name": location["display_name"],
            "approximate": location.get("approximate", False),
        }
        for location in points
    ]

    hos_plan = _generate_hos_plan(
        distance_miles=route["distance_miles"],
        cycle_used=float(trip.current_cycle_used),
    )

    route_summary = {
        "distance_miles": route["distance_miles"],
        "duration_hours": route["duration_hours"],
        "legs": route["legs"],
        "stops": [
            {
                "type": "Start",
                "details": origin["display_name"],
                "timestamp": None,
            },
            {
                "type": "Pickup",
                "details": pickup["display_name"],
                "timestamp": hos_plan.get("pickup_timestamp"),
            },
            {
                "type": "Dropoff",
                "details": dropoff["display_name"],
                "timestamp": hos_plan.get("dropoff_timestamp"),
            },
            *hos_plan["stops"],
        ],
        "fallback_route": route.get("fallback", False),
        "geocoding": geocoding_notes,
    }

    map_data = {
        "polyline": route["polyline"],
        "markers": [
            {
                "label": "Current Location",
                "latitude": origin["latitude"],
                "longitude": origin["longitude"],
                "approximate": origin.get("approximate", False),
            },
            {
                "label": "Pickup",
                "latitude": pickup["latitude"],
                "longitude": pickup["longitude"],
                "approximate": pickup.get("approximate", False),
            },
            {
                "label": "Dropoff",
                "latitude": dropoff["latitude"],
                "longitude": dropoff["longitude"],
                "approximate": dropoff.get("approximate", False),
            },
        ],
    }

    return {
        "route_summary": route_summary,
        "hos_logs": hos_plan["logs"],
        "map_data": map_data,
    }
