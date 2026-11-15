# 🌍 EARTHSCOPE
### Rice Variety Suitability & Agricultural Water-Risk Intelligence System

**Transforming NASA Earth Observation Data into Smarter Agricultural Decisions for Goa, India.**

EARTHSCOPE is an agricultural intelligence and decision-support platform designed to help understand agricultural water stress and identify suitable rice varieties across different ecological regions of Goa. By combining NASA satellite observations, geospatial analysis, and agricultural data, EARTHSCOPE provides insights into environmental conditions, water availability, and rice variety suitability.

The platform aims to make complex Earth observation data easier to understand through interactive maps, data visualizations, and location-specific agricultural insights.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Agricultural Regions of Goa](#-agricultural-regions-of-goa)
- [NASA Data Integration](#-nasa-data-integration)
- [How EARTHSCOPE Works](#-how-earthscope-works)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Applications and Benefits](#-applications-and-benefits)
- [Future Enhancements](#-future-enhancements)
- [Limitations](#-limitations)
- [Contributing](#-contributing)
- [Acknowledgements](#-acknowledgements)

---

## 🌱 Overview

Agriculture is highly dependent on environmental conditions such as rainfall, soil moisture, temperature, and water availability. These conditions vary significantly across geographical regions and directly influence agricultural productivity.

In Goa, rice cultivation takes place across different ecological environments, each having different soil and water characteristics.

EARTHSCOPE addresses this challenge by providing two major intelligence systems:

**1. Rice Variety Suitability Intelligence**

Helps identify and compare rice varieties based on the ecological and environmental conditions of a selected agricultural region.

**2. Agricultural Water-Risk Intelligence**

Uses NASA Earth observation data to investigate environmental indicators associated with agricultural water stress and identify areas that may require attention.

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
- Examine rainfall and soil moisture conditions.
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

- Examines satellite-derived rainfall and soil moisture information.
- Identifies unusual environmental conditions.
- Helps investigate areas potentially experiencing agricultural water stress.
- Combines multiple environmental indicators for a broader assessment.

### 3. Interactive Geospatial Maps

- Displays agricultural regions geographically.
- Provides location-based exploration.
- Visualizes environmental conditions and water-risk information.
- Helps users understand the geographical distribution of agricultural conditions.

### 4. Environmental Data Visualization

- Presents environmental information through charts and graphical representations.
- Helps users understand changes in rainfall and soil moisture.
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

NASA Earth observation data is a central component of EARTHSCOPE.

Satellite observations provide valuable information about environmental conditions that influence agriculture.

The project uses the following NASA data sources:

### 1. NASA GPM IMERG

**Global Precipitation Measurement – Integrated Multi-satellitE Retrievals for GPM**

Used for:
- Monitoring rainfall patterns.
- Examining precipitation distribution.
- Identifying rainfall deficits and unusual precipitation conditions.
- Understanding changes in water availability.

### 2. NASA SMAP L4

**Soil Moisture Active Passive – Level 4 Soil Moisture**

Used for:
- Monitoring surface and root-zone soil moisture.
- Understanding changes in soil water availability.
- Identifying potentially dry agricultural conditions.
- Supporting agricultural water-risk assessment.

### 3. NASA MODIS (Optional)

**Moderate Resolution Imaging Spectroradiometer**

Can be used for:
- Monitoring vegetation conditions.
- Examining vegetation health indicators.
- Understanding changes in land surface conditions.

### How NASA Data Is Used

The integration process follows these stages:

1. **Data Collection:** Retrieve relevant Earth observation datasets.
2. **Data Processing:** Clean and prepare the collected information.
3. **Geospatial Analysis:** Align environmental information with geographical regions.
4. **Indicator Analysis:** Examine rainfall, soil moisture, and other environmental conditions.
5. **Risk Assessment:** Identify unusual patterns associated with agricultural water stress.
6. **Visualization:** Display the resulting information through maps, charts, and dashboards.

NASA datasets provide environmental evidence for the platform. They do not independently determine the suitability of every rice variety; agricultural and ecological information is also required.

---

## ⚙️ How EARTHSCOPE Works

The platform follows a structured workflow:

**Step 1 – Select an Agricultural Region**

The user selects a geographical region or agricultural ecology in Goa.

**Step 2 – Explore Environmental Conditions**

The system presents relevant environmental information, including rainfall and soil moisture.

**Step 3 – Analyze Rice Variety Suitability**

Available agricultural and ecological information is used to compare rice varieties for the selected region.

**Step 4 – Assess Agricultural Water Risk**

Environmental indicators are examined to identify unusual or potentially unfavourable water conditions.

**Step 5 – Visualize Results**

The platform presents the findings using interactive maps, charts, and dashboard components.

**Step 6 – Support Decision-Making**

Users can use the resulting information to better understand agricultural conditions and support planning decisions.

---

## 🛠️ Technology Stack

EARTHSCOPE uses modern frontend, backend, data science, and geospatial technologies.

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

### Data Sources
- NASA GPM IMERG
- NASA SMAP L4
- NASA MODIS (optional)

### Deployment
- Vercel
- Render

---

## 🏗️ System Architecture

EARTHSCOPE follows a modular architecture that separates the frontend, backend, scientific processing, and geospatial components.

```text
                 NASA EARTH OBSERVATION DATA
                  GPM IMERG | SMAP L4
                       MODIS
                         |
                         v
                 DATA PROCESSING
             Cleaning and Preparation
              Quality and Unit Checks
                         |
                         v
                SCIENTIFIC ANALYSIS
                 |               |
                 v               v
          RICE SUITABILITY   WATER-RISK
              ENGINE          ENGINE
                 |               |
                 +-------+-------+
                         |
                         v
                   BACKEND API
                      FastAPI
                         |
                         v
                  FRONTEND SYSTEM
                   React + Vite
                         |
              +----------+----------+
              |          |          |
              v          v          v
           Dashboard   GIS Maps   Charts
              |          |          |
              +----------+----------+
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

Follow these steps to run EARTHSCOPE locally.

### Prerequisites

Make sure you have installed:

- Git
- Node.js and npm
- Python 3.10 or later
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/arsal1nnnn/EARTHSCOPE.git
```

Navigate into the project directory:

```bash
cd EARTHSCOPE
```

### 2. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

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

Install the backend dependencies using the dependency file provided in the backend directory.

For a requirements.txt-based setup:

```bash
pip install -r requirements.txt
```

Start the FastAPI application using its configured application entry point. For example, if the entry point is `app.main`:

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

*Note: Confirm the backend dependency filename and application entry point against the actual backend files before running these commands.*

---

## 🎯 Applications and Benefits

EARTHSCOPE is designed to support different agricultural stakeholders.

**Agricultural Officers**
- Explore agricultural conditions across different regions.
- Compare rice varieties.
- Review water-risk information.
- Support agricultural planning.

**Farmers**
- Better understand regional environmental conditions.
- Access information that can support crop planning.
- Explore potentially suitable rice varieties.

**Researchers**
- Study environmental patterns.
- Analyze satellite-derived agricultural indicators.
- Compare geographical and ecological conditions.

**Water Resource Planners**
- Identify areas that may require further investigation.
- Understand changing rainfall and soil moisture patterns.
- Support water-resource planning.

---

## 🔮 Future Enhancements

EARTHSCOPE can be extended with additional capabilities:

- Integration of more NASA Earth observation datasets.
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

- Satellite-derived measurements may have spatial and temporal resolution limitations.
- Environmental datasets may contain missing values or coverage gaps.
- Rice variety suitability depends on reliable agricultural and ecological information.
- Water-risk assessments should be validated against independent ground observations wherever possible.
- Model-based forecasts, if implemented, should be treated as estimates rather than guaranteed outcomes.

EARTHSCOPE is intended as an agricultural screening and decision-support platform. It does not replace field inspections, professional agronomic advice, or official agricultural and drought-warning systems.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Commit your changes.
5. Submit a pull request.

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

---

## 🙏 Acknowledgements

We would like to acknowledge:

- **NASA** – For providing Earth observation datasets and open scientific resources.
- **NASA GPM** – For precipitation monitoring data.
- **NASA SMAP** – For soil moisture observations.
- **NASA MODIS** – For optional vegetation and land-surface observations.
- **Open-source community** – For the tools and technologies used in developing this platform.
- **NASA Space Apps Challenge** – For providing the opportunity to develop innovative solutions using Earth science data.

---

## 🌍 About the Project

**EARTHSCOPE – Rice Variety Suitability & Agricultural Water-Risk Intelligence System**

Developed as part of the **NASA Space Apps Challenge**.

**Project Focus:** Agricultural Intelligence | Earth Observation | GIS | Data Science | Sustainable Agriculture

**Repository:** https://github.com/arsal1nnnn/EARTHSCOPE

---

*Turning Earth observation into actionable agricultural intelligence.* 🌱
