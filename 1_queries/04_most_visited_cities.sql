SELECT city,
       COUNT(*) AS total_reservations
  FROM reservations r
       JOIN properties p ON p.id = r.property_id
 GROUP BY city
 ORDER BY total_reservations DESC