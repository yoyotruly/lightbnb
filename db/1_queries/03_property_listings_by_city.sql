WITH property_avg_rating AS (
  SELECT property_id,
         AVG(rating) AS average_rating
    FROM property_reviews
   GROUP BY property_id
)

SELECT p.id,
       p.title,
	 p.cost_per_night,
	 r.average_rating
  FROM properties p
       JOIN property_avg_rating r ON p.id = r.property_id
 WHERE city LIKE '%Vancouver%'
       AND average_rating >= 4
 ORDER BY cost_per_night
 LIMIT 10;