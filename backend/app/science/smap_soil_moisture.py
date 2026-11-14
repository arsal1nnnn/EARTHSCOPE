"""Simulate and process NASA SMAP L4 root-zone soil moisture for Goa."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


ZONES = ("North_Goa_Morod", "North_Goa_Kher", "South_Goa_Khazan")
PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed"
PARQUET_PATH = OUTPUT_DIR / "smap_soil_moisture.parquet"
CSV_PATH = OUTPUT_DIR / "smap_soil_moisture.csv"


def historical_baselines(seed: int = 42, years: int = 5) -> dict[str, np.ndarray]:
	"""Generate reproducible historical root-zone moisture values (m3/m3)."""
	rng = np.random.default_rng(seed)
	count = years * 365
	means = {
		"North_Goa_Morod": 0.27,
		"North_Goa_Kher": 0.24,
		"South_Goa_Khazan": 0.31,
	}
	baselines = {}
	for zone, mean in means.items():
		day = np.arange(count) % 365
		monsoon_cycle = 0.055 * np.sin(2 * np.pi * (day - 145) / 365)
		values = mean + monsoon_cycle + rng.normal(0, 0.035, count)
		baselines[zone] = np.clip(values, 0.03, 0.65)
	return baselines


def simulate_smap_data(days: int = 30, seed: int = 42) -> pd.DataFrame:
	"""Simulate daily SMAP L4 observations and classify water-stress signals."""
	if days < 1:
		raise ValueError("days must be at least 1")

	rng = np.random.default_rng(seed)
	baselines = historical_baselines(seed)
	dates = pd.date_range(end=pd.Timestamp.now(tz="UTC").normalize(), periods=days, freq="D")
	rows = []

	for date in dates:
		for zone in ZONES:
			baseline = baselines[zone]
			seasonal = 0.045 * np.sin(2 * np.pi * date.dayofyear / 365)
			moisture = float(np.clip(np.mean(baseline) + seasonal + rng.normal(0, 0.025), 0.02, 0.70))
			percentile = float((baseline <= moisture).mean() * 100)

			if percentile <= 10:
				signal = "Severe Moisture Stress"
			elif percentile <= 25:
				signal = "Moderate Moisture Stress"
			elif percentile >= 90:
				signal = "High Saturation / Submergence Risk"
			else:
				signal = "Normal Range"

			rows.append(
				{
					"date": date.date(),
					"zone": zone,
					"root_zone_soil_moisture_m3_m3": round(moisture, 4),
					"historical_percentile": round(percentile, 2),
					"risk_signal": signal,
					"source": "Simulated NASA SMAP L4",
				}
			)

	return pd.DataFrame(rows)


def export_data(data: pd.DataFrame) -> None:
	"""Export processed observations to the project's CSV and Parquet outputs."""
	OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
	data.to_parquet(PARQUET_PATH, index=False)
	data.to_csv(CSV_PATH, index=False)


if __name__ == "__main__":
	observations = simulate_smap_data()
	export_data(observations)
	print(f"Exported {len(observations)} records to {PARQUET_PATH} and {CSV_PATH}")
