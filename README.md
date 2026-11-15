# 🌍 EARTHSCOPE
### Rice Variety Suitability & Agricultural Water-Risk Intelligence System

**Transforming NASA Earth Observation Data into Smarter Agricultural Decisions for Goa, India.**

EARTHSCOPE is an agricultural intelligence and decision-support platform designed to help understand agricultural water stress and identify suitable rice varieties across different ecological regions of Goa.

By combining NASA satellite observations, geospatial analysis, and agricultural data, EARTHSCOPE provides insights into rainfall anomalies, soil moisture conditions, and rice variety suitability to support informed agricultural planning and decision-making.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Agricultural Regions of Goa](#-agricultural-regions-of-goa)
- [NASA Data Integration](#-nasa-data-integration)
- [Dataset Summary](#-dataset-summary)
- [How EARTHSCOPE Works](#-how-earthscope-works)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Applications and Benefits](#-applications-and-benefits)
- [Future Enhancements](#-future-enhancements)
- [Limitations](#-limitations)
- [References and Data Sources](#-references-and-data-sources)
- [Acknowledgements](#-acknowledgements)

---

## 🌱 Overview

Agriculture is highly dependent on environmental conditions such as rainfall, soil moisture, temperature, and water availability. These conditions vary significantly across geographical regions and directly influence agricultural productivity.

In Goa, rice cultivation takes place across different ecological environments, each having different soil and water characteristics.

EARTHSCOPE addresses this challenge through two major intelligence systems:

**1. Rice Variety Suitability Intelligence**

Helps identify and compare rice varieties based on the ecological and environmental conditions of a selected agricultural region.

**2. Agricultural Water-Risk Intelligence**

Uses NASA Earth observation and land-surface model data to investigate rainfall anomalies and soil moisture conditions associated with agricultural water stress.

By combining these two systems, EARTHSCOPE aims to support more informed agricultural planning and decision-making.

---

## ❗ Problem Statement

Farmers and agricultural planners often face difficulties identifying suitable rice varieties and understanding changing water conditions across different agricultural regions.

Some of the major challenges include:

- Different agricultural regions have different soil and water characteristics.
- Rice varieties require specific environmental and growing conditions.
- Rainfall patterns and soil moisture levels can change over time.
- Environmental data is often distributed across different platforms.
- Identifying areas experiencing potential agricultural water stress can be difficult.
- Agricultural planning requires location-specific and understandable information.

There is a need for an accessible platform that combines environmental observations and agricultural information to help identify suitable rice varieties and investigate potential water-related risks.

---

## 💡 Our Solution

EARTHSCOPE provides a centralized agricultural intelligence platform that combines satellite-derived environmental information with geographical and agricultural data.

The system allows users to:

- Explore agricultural regions through interactive maps.
- Identify the ecological characteristics of selected regions.
- Compare rice varieties based on their suitability.
- Examine rainfall anomalies and soil moisture conditions.
- Visualize environmental indicators using charts and maps.
- Identify areas showing unusual water-related environmental conditions.
- Generate useful insights to support agricultural planning.

The goal is to convert complex environmental datasets into meaningful and understandable agricultural information.

---

## 🚀 Key Features

### 1. Rice Variety Suitability Analysis

- Identifies suitable rice varieties for different agricultural ecologies.
- Compares varieties using relevant environmental and agricultural characteristics.
- Helps users understand why a particular variety may be more suitable for a selected region.
- Supports location-specific agricultural planning.

### 2. Agricultural Water-Risk Assessment

- Examines NASA rainfall and root-zone soil moisture datasets.
- Identifies unusual rainfall patterns and soil moisture conditions.
- Helps investigate areas potentially experiencing agricultural water stress.
- Combines multiple environmental indicators for a broader assessment.

### 3. Interactive Geospatial Maps

- Displays agricultural regions geographically.
- Provides location-based exploration.
- Visualizes environmental conditions and water-risk information.
- Helps users understand the geographical distribution of agricultural conditions.

### 4. Environmental Data Visualization

- Presents rainfall and soil moisture information through charts and graphical representations.
- Helps users understand changes in environmental conditions.
- Makes complex datasets easier to interpret.
- Supports comparison between geographical regions.

### 5. Decision-Support Dashboard

- Provides a centralized interface for agricultural information.
- Connects rice suitability and water-risk insights.
- Helps agricultural planners explore regions and compare available information.
- Presents environmental evidence in an accessible format.

---

## 🌾 Agricultural Regions of Goa

EARTHSCOPE focuses on three major rice-growing ecological environments in Goa.

| Agricultural Ecology | Description |
|---|---|
| Morod | Rainfed upland agricultural areas |
| Kher | Rainfed shallow lowland agricultural areas |
| Khazan | Coastal lowland agricultural areas influenced by saline and tidal conditions |

Each ecology has different environmental characteristics and agricultural requirements.

EARTHSCOPE uses these ecological differences to support more relevant rice variety suitability assessments.

---

## 🛰️ NASA Data Integration

NASA Earth observation and land-surface model data are central components of EARTHSCOPE.

The project uses **three NASA data products from two major NASA sources:**

1. Global Precipitation Measurement (GPM) – Rainfall analysis.
2. Global Land Data Assimilation System (GLDAS) – Soil moisture analysis.

These datasets are accessed through **NASA Giovanni**, which provides tools for accessing, processing, analyzing, and visualizing Earth science data.

### 1. GPM IMERG Final Run – Monthly (GPM_3IMERGM v07)

**Purpose: Kharif 2025 Rainfall Anomaly Analysis**

This dataset is used to analyze rainfall anomalies across Goa's districts and 12 talukas during the Kharif 2025 season.

**Applications:**
- Analyze monthly rainfall patterns.
- Identify areas receiving unusually high or low rainfall.
- Compare rainfall against historical conditions.
- Support district-level and taluka-level rainfall assessment.

| Parameter | Details |
|---|---|
| Dataset | GPM_3IMERGM v07 |
| Product | GPM IMERG Final Run – Monthly |
| Resolution | 0.1° (approximately 11 km) |
| Data Period | 2001 – September 2025 |
| Accessed Through | NASA Giovanni |
| Application | Kharif 2025 rainfall anomaly analysis |

### 2. GPM IMERG Late Run – Daily (GPM_3IMERGDL v07)

**Purpose: Preliminary Kharif 2026 Rainfall Anomaly Analysis**

This dataset is used to examine daily rainfall patterns and preliminary rainfall anomalies across Goa's districts during Kharif 2026.

**Applications:**
- Examine daily rainfall patterns.
- Identify preliminary rainfall anomalies.
- Monitor recent rainfall conditions.
- Support district-level rainfall assessment for Kharif 2026.

| Parameter | Details |
|---|---|
| Dataset | GPM_3IMERGDL v07 |
| Product | GPM IMERG Late Run – Daily |
| Resolution | 0.1° (approximately 11 km) |
| Data Period | 2001 – October 2026 |
| Accessed Through | NASA Giovanni |
| Application | Preliminary Kharif 2026 rainfall anomaly analysis |

### 3. GLDAS-2.1 Noah – 3-Hourly (GLDAS_NOAH025_3H v2.1)

**Purpose: Root-Zone Soil Moisture Analysis**

This dataset is used to understand soil moisture conditions and identify areas experiencing unusually low root-zone soil moisture.

**Applications:**
- Calculate soil moisture percentiles for Kharif 2025.
- Examine soil moisture conditions during June–July 2026.
- Identify unusually low root-zone soil moisture conditions.
- Support agricultural water-risk assessment.

| Parameter | Details |
|---|---|
| Dataset | GLDAS_NOAH025_3H v2.1 |
| Product | GLDAS-2.1 Noah – 3-Hourly |
| Variable | Root-zone soil moisture |
| Resolution | 0.25° (approximately 25–28 km) |
| Data Period | 2000 – July 2026 |
| Accessed Through | NASA Giovanni |
| Application | Soil moisture percentile analysis |

---

## 📊 Dataset Summary

EARTHSCOPE uses three NASA data products from two NASA sources to investigate rainfall and soil moisture conditions.

| Dataset | What It Is Used For | Resolution | Period |
|---|---|---|---|
| GPM IMERG Final Monthly | Kharif 2025 rainfall anomalies – districts and 12 talukas | 0.1° (~11 km) | 2001–Sep 2025 |
| GPM IMERG Late Daily | Preliminary Kharif 2026 rainfall anomalies – districts | 0.1° (~11 km) | 2001–Oct 2026 |
| GLDAS-2.1 Noah 3-Hourly | Kharif 2025 and June–July 2026 root-zone soil moisture percentiles | 0.25° (~25–28 km) | 2000–Jul 2026 |

### Two NASA Sources, Three Data Products

**GPM – Global Precipitation Measurement**

Provides rainfall information through two IMERG products:
- Final Run – Monthly.
- Late Run – Daily.

**GLDAS – Global Land Data Assimilation System**

Provides land-surface model information through:
- GLDAS-2.1 Noah – 3-Hourly.

Together, these datasets provide complementary information about rainfall variability and root-zone soil moisture conditions.

**Note:** The rainfall and soil moisture datasets have different spatial resolutions. Their geographical coverage and resolution are considered when interpreting regional results.

---

## ⚙️ How EARTHSCOPE Works

The platform follows a structured workflow:

**Step 1 – Select an Agricultural Region**

The user selects a geographical region or agricultural ecology in Goa.

**Step 2 – Explore Environmental Conditions**

The system presents relevant environmental information, including rainfall anomalies and soil moisture conditions.

**Step 3 – Analyze Rice Variety Suitability**

Available agricultural and ecological information is used to compare rice varieties for the selected region.

**Step 4 – Assess Agricultural Water Risk**

Rainfall and root-zone soil moisture indicators are examined to identify unusual or potentially unfavourable water conditions.

**Step 5 – Visualize Results**

The platform presents the findings using interactive maps, charts, and dashboard components.

**Step 6 – Support Decision-Making**

Users can use the resulting information to better understand agricultural conditions and support planning decisions.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Leaflet
- Leaflet
- Recharts
- Axios
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- SQLite

### Data Science and Processing
- Python
- Pandas
- NumPy
- Xarray
- SciPy

### GIS and Geospatial Analysis
- QGIS
- GeoPandas
- Rasterio
- GeoJSON

### NASA Data Sources
- GPM IMERG Final Run – Monthly.
- GPM IMERG Late Run – Daily.
- GLDAS-2.1 Noah – 3-Hourly.
- NASA Giovanni – Data access and analysis platform.

### Deployment
- Vercel
- Render

---

## 🏗️ System Architecture

EARTHSCOPE follows a modular architecture that separates the frontend, backend, scientific processing, and geospatial components.

```text
              NASA DATA SOURCES
                      |
           +----------+----------+
           |                     |
           v                     v
       NASA GPM               NASA GLDAS
     Rainfall Data          Soil Moisture
           |                     |
           +----------+----------+
                      |
                      v
               NASA GIOVANNI
              DATA ACQUISITION
                      |
                      v
                DATA PROCESSING
             Cleaning and Preparation
              Quality and Unit Checks
                      |
                      v
              SCIENTIFIC ANALYSIS
                 |            |
                 v            v
           RICE SUITABILITY  WATER-RISK
               ENGINE        ENGINE
                 |            |
                 +-----+------+
                       |
                       v
                  BACKEND API
                    FastAPI
                       |
                       v
                 FRONTEND SYSTEM
                  React + Vite
                       |
             +---------+---------+
             |         |         |
             v         v         v
          Dashboard  GIS Maps  Charts
             |         |         |
             +---------+---------+
                       |
                       v
              AGRICULTURAL INSIGHTS
```

The modular design allows the rice suitability and agricultural water-risk systems to operate as separate analytical components while presenting their results through one unified interface.

---

## 📂 Project Structure

The repository is organized into separate modules for frontend development, backend services, data storage, documentation, and geospatial resources.

```text
EARTHSCOPE/
│
├── backend/
│   └── Backend application and API services
│
├── data/
│   └── Agricultural and environmental datasets
│
├── docs/
│   └── Project documentation
│
├── frontend/
│   └── React application and user interface
│
├── gis/
│   └── Geospatial data and mapping resources
│
└── README.md
```

---

## 💻 Installation and Setup

### Prerequisites

- Git
- Node.js and npm
- Python 3.10 or later
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/arsal1nnnn/EARTHSCOPE.git
cd EARTHSCOPE
```

### 2. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal (usually):

```text
http://localhost:5173
```

### 3. Set Up the Backend

Open a second terminal and navigate to the backend directory:

```bash
cd EARTHSCOPE/backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Install dependencies using the requirements file:

```bash
pip install -r requirements.txt
```

Start the FastAPI application (assuming the entry point is `app.main`):

```bash
uvicorn app.main:app --reload
```

The backend API will generally be available at:

```text
http://localhost:8000
```

FastAPI interactive documentation:

```text
http://localhost:8000/docs
```

*Note: Confirm the backend dependency filename and application entry point against the actual backend files.*

---

## 🎯 Applications and Benefits

### Agricultural Officers
- Explore agricultural conditions across different regions.
- Compare rice varieties.
- Review rainfall and soil moisture information.
- Support agricultural planning.

### Farmers
- Better understand regional environmental conditions.
- Access information that can support crop planning.
- Explore potentially suitable rice varieties.

### Researchers
- Study environmental patterns.
- Analyze satellite-derived agricultural indicators.
- Compare geographical and ecological conditions.

### Water Resource Planners
- Identify areas that may require further investigation.
- Understand changing rainfall and soil moisture patterns.
- Support water-resource planning.

---

## 🔮 Future Enhancements

- Integration of additional NASA Earth observation datasets.
- Improved rice variety recommendation models.
- More detailed soil and salinity information.
- Machine-learning-based agricultural water-risk forecasting.
- Historical environmental trend analysis.
- Improved regional and village-level mapping.
- Multilingual support for local agricultural users.
- Downloadable agricultural assessment reports.
- Mobile-friendly access for field use.
- Integration of ground-based agricultural observations for validation.

---

## ⚠️ Limitations

- Satellite-derived rainfall measurements have spatial and temporal resolution limitations.
- GLDAS soil moisture is based on land-surface modelling and is not a direct measurement at every agricultural location.
- The GPM and GLDAS products have different spatial resolutions.
- Environmental datasets may contain missing values or coverage gaps.
- Taluka-level analysis is subject to the limitations of the underlying dataset resolution and geographical aggregation.
- Rice variety suitability depends on reliable agricultural and ecological information.
- Water-risk assessments should be validated against independent ground observations wherever possible.

EARTHSCOPE is intended as an agricultural screening and decision-support platform. It does not replace field inspections, professional agronomic advice, or official agricultural and drought-warning systems.

---

## 📚 References and Data Sources

The following official scientific and institutional resources were used as references for EARTHSCOPE's environmental data integration and agricultural research.

### NASA Data Sources

**1. NASA Global Precipitation Measurement (GPM)**

Official source for the GPM mission and its precipitation datasets.

https://gpm.nasa.gov/

**2. GPM IMERG – Final Run Monthly (GPM_3IMERGM v07)**

Used for Kharif 2025 rainfall anomaly analysis across Goa's districts and 12 talukas.

https://gpm.nasa.gov/data/imerg

**3. GPM IMERG – Late Run Daily (GPM_3IMERGDL v07)**

Used for preliminary Kharif 2026 rainfall anomaly analysis across Goa's districts.

https://gpm.nasa.gov/data/imerg

**4. NASA Global Land Data Assimilation System (GLDAS)**

Official source for GLDAS land-surface modelling datasets.

https://ldas.gsfc.nasa.gov/gldas

**5. GLDAS-2.1 Noah – 3-Hourly (GLDAS_NOAH025_3H v2.1)**

Used for root-zone soil moisture percentile analysis during Kharif 2025 and June–July 2026.

https://disc.gsfc.nasa.gov/datasets/GLDAS_NOAH025_3H_2.1/summary

**6. NASA Giovanni**

The online platform used to access, process, analyze, and visualize the NASA datasets used in EARTHSCOPE.

https://giovanni.gsfc.nasa.gov/giovanni/

### Agricultural and Rice Research Sources

**7. ICAR – Central Coastal Agricultural Research Institute (CCARI), Goa**

Reference for rice cultivation in Goa and its three major agricultural ecologies: Morod, Kher, and Khazan.

https://ccari.res.in/dss/rice.html

**8. ICAR – Central Rice Research Institute (CRRI)**

Reference for released rice varieties, their characteristics, and suitable agricultural ecosystems.

https://icar-crri.in/released-varieties/

**9. Indian Rice Varietal Information Database**

Reference for rice variety information, including cultivation ecosystems, duration, recommended states, and varietal characteristics.

https://rice-garud.icar-web.com/varieties.php

**10. Goa Forest Department – Land Classification Report**

Reference for the characteristics of Khazan, Kher, and Morod land types in Goa.

https://www.forest.goa.gov.in/sites/default/files/2022-06/FINAL-REPORT-and-SUBMITTED.pdf

---

## 🙏 Acknowledgements

We would like to acknowledge:

- **NASA** – For providing Earth observation datasets and scientific resources.
- **NASA GPM** – For precipitation monitoring data.
- **NASA GLDAS** – For land-surface modelling and soil moisture information.
- **NASA Giovanni** – For providing access to Earth science data analysis and visualization tools.
- **ICAR-CCARI, Goa** – For agricultural research and information about rice cultivation in Goa.
- **ICAR-CRRI** – For rice variety research and agricultural information.
- **Open-source community** – For the tools and technologies used in developing this platform.
- **NASA Space Apps Challenge** – For providing the opportunity to develop innovative solutions using Earth science data.

---

## 🌍 About the Project

**EARTHSCOPE – Rice Variety Suitability & Agricultural Water-Risk Intelligence System**

Developed as part of the **NASA Space Apps Challenge**.

**Project Focus:** Agricultural Intelligence | Earth Observation | GIS | Data Science | Sustainable Agriculture

**GitHub Repository:** https://github.com/arsal1nnnn/EARTHSCOPE

---

*Turning Earth observation into actionable agricultural intelligence.* 🌱
