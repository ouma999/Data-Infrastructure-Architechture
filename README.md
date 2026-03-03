# A Data Infrastructure & CRM System

## Overview
This repository contains a production-ready **SQL Server** database schema and a **Node.js** backend designed for a corporate CRM and Business Intelligence environment. As a **Data Science/Analyst** project, it demonstrates the ability to bridge the gap between raw data storage and actionable business insights.

## Technical Architecture
* **Database:** Microsoft SQL Server (T-SQL)
* **Backend:** Node.js (Express) with `mssql` driver
* **Data Modeling:** Relational design with strict referential integrity
* **Version Control:** Git/GitHub flow

## Data Modeling Highlights
The database schema (`database_schema.sql`) includes 10+ interconnected tables designed for deep analytical drilling:
* **Relational Mapping:** Tracks the full lifecycle of a lead—from initial contact to case study success.
* **Analytical Views:** Includes pre-built views like `v_open_leads` for real-time sales pipeline monitoring.
* **Optimization:** Implements non-clustered indexing on high-traffic columns (`industry`, `status`) to ensure sub-millisecond query response times.

## Analytical Capabilities
The project includes a dedicated `analysis_queries.sql` file that provides business intelligence on:
1. **Market Penetration:** Identifies which industries yield the highest lead volume.
2. **Tech Stack Usage:** Analyzes the frequency of specific technologies across successful client projects.
3. **Team Performance:** Aggregates workload distribution among active team members.

## How to Replicate
1. Clone this repository.
2. Execute `database_schema.sql` in **SQL Server Management Studio (SSMS)** to build the environment.
3. Configure your `.env` file with local database credentials.
4. Run `npm install` and `npm run dev` to start the API server.