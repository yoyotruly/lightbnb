WITH property_avg_rating AS (
  SELECT property_id,
         AVG(rating) AS average_rating
    FROM property_reviews
   GROUP BY property_id
)

SELECT r.id,
       p.title,
       r.start_date,
       p.cost_per_night,
       ar.average_rating
  FROM users u
       LEFT JOIN reservations r ON u.id = r.guest_id
       JOIN properties p ON p.id = r.property_id
       JOIN property_avg_rating ar ON p.id = ar.property_id
 WHERE u.id = 1
 ORDER BY start_date
 LIMIT 10;
