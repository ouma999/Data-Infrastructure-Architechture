USE comex_db;
GO

-- 1. LEAD CONVERSION & MARKET PENETRATION
-- Which industries are most interested in our services?
SELECT 
    industry, 
    COUNT(id) AS total_leads,
    status
FROM dbo.leads
GROUP BY industry, status
ORDER BY total_leads DESC;

-- 2. TECHNOLOGY TREND ANALYSIS
-- Which technologies are we using most across our successful case studies?
SELECT 
    t.name AS technology_name, 
    COUNT(cst.case_study_id) AS usage_count
FROM dbo.technologies t
JOIN dbo.case_study_technologies cst ON t.id = cst.tech_id
GROUP BY t.name
ORDER BY usage_count DESC;

-- 3. TEAM WORKLOAD REPORT
-- Which team members are managing the most active leads?
SELECT 
    tm.full_name, 
    COUNT(l.id) AS assigned_leads
FROM dbo.team_members tm
LEFT JOIN dbo.leads l ON tm.id = l.assigned_to
WHERE tm.is_active = 1
GROUP BY tm.full_name;