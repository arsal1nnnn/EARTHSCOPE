#!/usr/bin/env python3
"""
prepare_goa_geojson.py
======================
GIS Data Preparation Script for EARTHSCOPE (NASA Space Apps Challenge)
M5 Role: Maps & Geospatial Visualization

Description:
Filters Goa's 12 talukas from GADM Level-3 India boundaries, standardizes
region_id codes, simplifies geometry (tolerance=0.001, EPSG:4326), and outputs:
  1. data/boundaries/goa_talukas.geojson (shared for Backend M3 and Science M4)
  2. frontend/src/data/goa_mock.geojson  (with realistic mock metrics for frontend)

Data Contract:
  Properties schema:
    - region_id: e.g. "GOA-S-SALCETE"
    - name: e.g. "Salcete"
    - district: "North Goa" | "South Goa"
    - asi_score: int (0 - 100)
    - stress_category: "Severe" | "Elevated" | "Moderate" | "Low" | "Normal"
    - soil_moisture_pct: int
    - rainfall_anomaly: float
    - predicted_30d_prob: float
    - evidence_coverage: float
"""

import os
import sys
import json
import math
import urllib.request

# Resolve repository paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

CANDIDATE_INPUT_PATHS = [
    os.path.join(REPO_ROOT, "data", "gadm41_IND_3.json"),
    os.path.join(REPO_ROOT, "data", "boundaries", "india_taluk.json"),
]

OUTPUT_SHARED = os.path.join(REPO_ROOT, "data", "boundaries", "goa_talukas.geojson")
OUTPUT_FRONTEND = os.path.join(REPO_ROOT, "frontend", "src", "data", "goa_mock.geojson")

GADM_SOURCE_URL = "https://raw.githubusercontent.com/geohacker/india/master/taluk/india_taluk.geojson"

# 12 Standardized Talukas Specification
TALUKA_DEFINITIONS = {
    "GOA-N-PERNEM": {
        "name": "Pernem",
        "district": "North Goa",
        "match_keys": ["Pernem"],
        "mock": {
            "asi_score": 42,
            "stress_category": "Moderate",
            "soil_moisture_pct": 22,
            "rainfall_anomaly": -12.5,
            "predicted_30d_prob": 0.38,
            "evidence_coverage": 0.94,
        },
    },
    "GOA-N-BARDEZ": {
        "name": "Bardez",
        "district": "North Goa",
        "match_keys": ["Mapuca", "Bardes", "Bardez"],
        "mock": {
            "asi_score": 35,
            "stress_category": "Moderate",
            "soil_moisture_pct": 26,
            "rainfall_anomaly": -8.0,
            "predicted_30d_prob": 0.28,
            "evidence_coverage": 0.96,
        },
    },
    "GOA-N-TISWADI": {
        "name": "Tiswadi",
        "district": "North Goa",
        "match_keys": ["Panaji", "Tiswadi", "Goa"],
        "mock": {
            "asi_score": 28,
            "stress_category": "Low",
            "soil_moisture_pct": 29,
            "rainfall_anomaly": -4.5,
            "predicted_30d_prob": 0.19,
            "evidence_coverage": 0.95,
        },
    },
    "GOA-N-BICHOLIM": {
        "name": "Bicholim",
        "district": "North Goa",
        "match_keys": ["Dicholi", "Bicholim"],
        "mock": {
            "asi_score": 58,
            "stress_category": "Elevated",
            "soil_moisture_pct": 17,
            "rainfall_anomaly": -18.2,
            "predicted_30d_prob": 0.62,
            "evidence_coverage": 0.92,
        },
    },
    "GOA-N-SATTARI": {
        "name": "Sattari",
        "district": "North Goa",
        "match_keys": ["Valpoy", "Satari", "Sattari"],
        "mock": {
            "asi_score": 22,
            "stress_category": "Low",
            "soil_moisture_pct": 34,
            "rainfall_anomaly": 5.4,
            "predicted_30d_prob": 0.14,
            "evidence_coverage": 0.89,
        },
    },
    "GOA-S-PONDA": {
        "name": "Ponda",
        "district": "South Goa",
        "match_keys": ["Ponda"],
        "mock": {
            "asi_score": 48,
            "stress_category": "Moderate",
            "soil_moisture_pct": 21,
            "rainfall_anomaly": -14.0,
            "predicted_30d_prob": 0.45,
            "evidence_coverage": 0.93,
        },
    },
    "GOA-S-MORMUGAO": {
        "name": "Mormugao",
        "district": "South Goa",
        "match_keys": ["Sambaji", "Marmagao", "Mormugao"],
        "mock": {
            "asi_score": 52,
            "stress_category": "Elevated",
            "soil_moisture_pct": 18,
            "rainfall_anomaly": -16.5,
            "predicted_30d_prob": 0.55,
            "evidence_coverage": 0.90,
        },
    },
    "GOA-S-SALCETE": {
        "name": "Salcete",
        "district": "South Goa",
        "match_keys": ["Madgaon", "Sasashti", "Salcete"],
        "mock": {
            "asi_score": 63,
            "stress_category": "Elevated",
            "soil_moisture_pct": 14,
            "rainfall_anomaly": -24.0,
            "predicted_30d_prob": 0.71,
            "evidence_coverage": 0.91,
        },
    },
    "GOA-S-QUEPEM": {
        "name": "Quepem",
        "district": "South Goa",
        "match_keys": ["Quepem"],
        "mock": {
            "asi_score": 74,
            "stress_category": "Severe",
            "soil_moisture_pct": 11,
            "rainfall_anomaly": -32.5,
            "predicted_30d_prob": 0.82,
            "evidence_coverage": 0.93,
        },
    },
    "GOA-S-SANGUEM": {
        "name": "Sanguem",
        "district": "South Goa",
        "match_keys": ["Sanguem"],
        "mock": {
            "asi_score": 38,
            "stress_category": "Moderate",
            "soil_moisture_pct": 25,
            "rainfall_anomaly": -9.8,
            "predicted_30d_prob": 0.32,
            "evidence_coverage": 0.88,
        },
    },
    "GOA-S-DHARBANDORA": {
        "name": "Dharbandora",
        "district": "South Goa",
        "match_keys": ["Dharbandora", "Sanguem"],
        "mock": {
            "asi_score": 67,
            "stress_category": "Elevated",
            "soil_moisture_pct": 13,
            "rainfall_anomaly": -27.0,
            "predicted_30d_prob": 0.76,
            "evidence_coverage": 0.90,
        },
    },
    "GOA-S-CANACONA": {
        "name": "Canacona",
        "district": "South Goa",
        "match_keys": ["Chauri", "Kankon", "Canacona"],
        "mock": {
            "asi_score": 14,
            "stress_category": "Normal",
            "soil_moisture_pct": 32,
            "rainfall_anomaly": 8.2,
            "predicted_30d_prob": 0.08,
            "evidence_coverage": 0.92,
        },
    },
}

# --- Douglas-Peucker Simplification Implementation ---

def perpendicular_distance(point, line_start, line_end):
    x, y = point[0], point[1]
    x1, y1 = line_start[0], line_start[1]
    x2, y2 = line_end[0], line_end[1]
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return math.hypot(x - proj_x, y - proj_y)

def rdp_open(points, tolerance):
    if len(points) < 3:
        return points
    dmax = 0.0
    index = 0
    end = len(points) - 1
    for i in range(1, end):
        d = perpendicular_distance(points[i], points[0], points[end])
        if d > dmax:
            index = i
            dmax = d
    if dmax > tolerance:
        rec1 = rdp_open(points[:index + 1], tolerance)
        rec2 = rdp_open(points[index:], tolerance)
        return rec1[:-1] + rec2
    else:
        return [points[0], points[end]]

def simplify_ring(ring, tolerance=0.001):
    if len(ring) <= 4:
        return ring
    is_closed = (ring[0][0] == ring[-1][0] and ring[0][1] == ring[-1][1])
    if is_closed:
        half = len(ring) // 2
        part1 = rdp_open(ring[:half + 1], tolerance)
        part2 = rdp_open(ring[half:], tolerance)
        res = part1[:-1] + part2
        if len(res) < 4:
            return ring
        res[-1] = [res[0][0], res[0][1]]
        return [[round(pt[0], 6), round(pt[1], 6)] for pt in res]
    else:
        res = rdp_open(ring, tolerance)
        return [[round(pt[0], 6), round(pt[1], 6)] for pt in res]

def simplify_geometry(geom, tolerance=0.001):
    gtype = geom.get("type")
    coords = geom.get("coordinates")
    if gtype == "Polygon":
        new_coords = [simplify_ring(ring, tolerance) for ring in coords]
        return {"type": "Polygon", "coordinates": new_coords}
    elif gtype == "MultiPolygon":
        new_coords = [[simplify_ring(ring, tolerance) for ring in poly] for poly in coords]
        return {"type": "MultiPolygon", "coordinates": new_coords}
    return geom

def clip_polygon_horizontal(ring, split_lat=15.28):
    upper_ring = []
    lower_ring = []
    n = len(ring)
    for i in range(n - 1):
        p1 = ring[i]
        p2 = ring[i + 1]
        intersects = (p1[1] < split_lat <= p2[1]) or (p2[1] < split_lat <= p1[1])
        inter_pt = None
        if intersects and p1[1] != p2[1]:
            t = (split_lat - p1[1]) / (p2[1] - p1[1])
            inter_x = p1[0] + t * (p2[0] - p1[0])
            inter_pt = [round(inter_x, 6), round(split_lat, 6)]

        if p1[1] >= split_lat:
            upper_ring.append(p1)
        if inter_pt:
            upper_ring.append(inter_pt)
            lower_ring.append(inter_pt)
        if p1[1] < split_lat:
            lower_ring.append(p1)

    if upper_ring and upper_ring[0] != upper_ring[-1]:
        upper_ring.append(upper_ring[0])
    if lower_ring and lower_ring[0] != lower_ring[-1]:
        lower_ring.append(lower_ring[0])

    return upper_ring, lower_ring

def load_source_boundaries():
    for candidate in CANDIDATE_INPUT_PATHS:
        if os.path.exists(candidate):
            print(f"Loading local boundaries from: {candidate}")
            with open(candidate, "r", encoding="utf-8") as f:
                return json.load(f)

    print(f"Fetching boundaries from GADM repository: {GADM_SOURCE_URL}...")
    req = urllib.request.Request(GADM_SOURCE_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

def main():
    print("=" * 65)
    print("EARTHSCOPE: Preparing Goa 12 Talukas GeoJSON (EPSG:4326)")
    print("=" * 65)

    raw_data = load_source_boundaries()
    all_features = raw_data.get("features", [])

    # Filter features where state is Goa
    goa_features = []
    for f in all_features:
        p = f.get("properties", {})
        # Check both GADM v3 and v4 property schemas
        name_1 = p.get("NAME_1", "")
        gid_1 = p.get("GID_1", "")
        if name_1 == "Goa" or gid_1.startswith("IND.10"):
            goa_features.append(f)

    print(f"Found {len(goa_features)} Goa features in source dataset.")

    # Helper to match feature by names or variant names
    def find_feature_by_keys(keys):
        for f in goa_features:
            p = f.get("properties", {})
            name_3 = str(p.get("NAME_3", "")).lower()
            var_3 = str(p.get("VARNAME_3", "")).lower()
            for k in keys:
                kl = k.lower()
                if kl == name_3 or kl == var_3:
                    return f
        return None

    # Island feature n.a. (1882) for Tiswadi
    island_feat = None
    for f in goa_features:
        p = f.get("properties", {})
        name_3 = str(p.get("NAME_3", "")).lower()
        if "n.a." in name_3 or "1882" in name_3:
            island_feat = f
            break

    shared_features = []
    mock_features = []

    for region_id, meta in TALUKA_DEFINITIONS.items():
        matched_feat = find_feature_by_keys(meta["match_keys"])
        if not matched_feat:
            print(f"Error: Could not match feature for {region_id} (keys: {meta['match_keys']})")
            continue

        geom = matched_feat["geometry"]

        # Case 1: Tiswadi - merge mainland Panaji with Mandovi island
        if region_id == "GOA-N-TISWADI" and island_feat:
            panaji_type = geom["type"]
            island_type = island_feat["geometry"]["type"]
            panaji_coords = geom["coordinates"]
            island_coords = island_feat["geometry"]["coordinates"]

            polys = []
            if panaji_type == "MultiPolygon":
                polys.extend(panaji_coords)
            else:
                polys.append(panaji_coords)

            if island_type == "MultiPolygon":
                polys.extend(island_coords)
            else:
                polys.append(island_coords)

            geom = {
                "type": "MultiPolygon",
                "coordinates": polys
            }

        # Case 2: Sanguem split into Dharbandora (North) and Sanguem (South)
        elif region_id == "GOA-S-DHARBANDORA":
            ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]
            upper_ring, _ = clip_polygon_horizontal(ring, split_lat=15.28)
            geom = {"type": "Polygon", "coordinates": [upper_ring]}

        elif region_id == "GOA-S-SANGUEM":
            ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]
            _, lower_ring = clip_polygon_horizontal(ring, split_lat=15.28)
            geom = {"type": "Polygon", "coordinates": [lower_ring]}

        # Simplify polygon geometries (tolerance=0.001 deg ~100m in EPSG:4326)
        simplified_geom = simplify_geometry(geom, tolerance=0.001)

        # 1. Base Boundary Properties (Shared with Backend M3 and Science M4)
        base_props = {
            "region_id": region_id,
            "name": meta["name"],
            "district": meta["district"],
        }
        shared_features.append({
            "type": "Feature",
            "properties": base_props,
            "geometry": simplified_geom,
        })

        # 2. Complete Frontend Mock Properties (Contract Compliant)
        mock_props = {
            "region_id": region_id,
            "name": meta["name"],
            "district": meta["district"],
            "asi_score": meta["mock"]["asi_score"],
            "stress_category": meta["mock"]["stress_category"],
            "soil_moisture_pct": meta["mock"]["soil_moisture_pct"],
            "rainfall_anomaly": meta["mock"]["rainfall_anomaly"],
            "predicted_30d_prob": meta["mock"]["predicted_30d_prob"],
            "evidence_coverage": meta["mock"]["evidence_coverage"],
        }
        mock_features.append({
            "type": "Feature",
            "properties": mock_props,
            "geometry": simplified_geom,
        })

    # Save outputs
    os.makedirs(os.path.dirname(OUTPUT_SHARED), exist_ok=True)
    shared_geojson = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": shared_features,
    }
    with open(OUTPUT_SHARED, "w", encoding="utf-8") as f:
        json.dump(shared_geojson, f, indent=2)

    os.makedirs(os.path.dirname(OUTPUT_FRONTEND), exist_ok=True)
    mock_geojson = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": mock_features,
    }
    with open(OUTPUT_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(mock_geojson, f, indent=2)

    shared_size_kb = os.path.getsize(OUTPUT_SHARED) / 1024
    mock_size_kb = os.path.getsize(OUTPUT_FRONTEND) / 1024

    print(f"\nSuccessfully generated {len(shared_features)} / 12 taluka boundaries:")
    print(f"  -> {OUTPUT_SHARED} ({shared_size_kb:.1f} KB)")
    print(f"  -> {OUTPUT_FRONTEND} ({mock_size_kb:.1f} KB)")
    print("\nVerified Taluka Region IDs & Metrics:")
    for feat in mock_features:
        p = feat["properties"]
        print(f"  * {p['region_id']}: {p['name']} ({p['district']}) | ASI: {p['asi_score']} | Stress: {p['stress_category']} | SM: {p['soil_moisture_pct']}% | Rain Anom: {p['rainfall_anomaly']}%")

if __name__ == "__main__":
    main()
