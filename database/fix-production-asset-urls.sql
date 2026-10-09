-- Normalize legacy CMS upload URLs after the frontend/API host split.
-- Review the preview query, take a database backup, then run this file once.

SET NAMES utf8mb4;
START TRANSACTION;

SELECT ModelName, Id, Data
FROM WebsiteDocuments
WHERE Data LIKE '%localhost:5001/uploads/%'
   OR Data LIKE '%ceypetco.gov.lk/uploads/%';

UPDATE WebsiteDocuments
SET Data = REPLACE(
             REPLACE(
               REPLACE(
                 REPLACE(Data,
                   'http://localhost:5001/uploads/',
                   'https://api.ceypetco.gov.lk/uploads/'),
                 'https://ceypetco.gov.lk/uploads/',
                 'https://api.ceypetco.gov.lk/uploads/'),
               'https://www.ceypetco.gov.lk/uploads/',
               'https://api.ceypetco.gov.lk/uploads/'),
             'http://api.ceypetco.gov.lk/uploads/',
             'https://api.ceypetco.gov.lk/uploads/'),
    UpdatedAt = UTC_TIMESTAMP(3)
WHERE Data LIKE '%localhost:5001/uploads/%'
   OR Data LIKE '%ceypetco.gov.lk/uploads/%';

SELECT ROW_COUNT() AS UpdatedDocuments;
COMMIT;

SELECT COUNT(*) AS RemainingLegacyUrls
FROM WebsiteDocuments
WHERE Data LIKE '%localhost:5001/uploads/%'
   OR Data LIKE '%ceypetco.gov.lk/uploads/%';

