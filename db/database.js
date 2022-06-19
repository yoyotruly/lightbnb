const db = require('./index');


/* ------ Users ------ */

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  const param = [email.toLowerCase()];

  return db
    .query(query, param)
    .then(res => {
      const user = res.rows[0];
      if (!user) return null;
      return user;
    })
    .catch(err => console.log(err.stack));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const query = "SELECT * FROM users WHERE id = $1";
  const param = [id];

  return db
    .query(query, param)
    .then(res => {
      const user = res.rows[0];
      if (!user) return null;
      return user;
    })
    .catch(err => console.log(err.stack));
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const params = [
    user.name,
    user.email,
    user.password
  ];

  return db
    .query(query, params)
    .then(res => res.rows[0])
    .catch(err => console.log(err.stack));
};
exports.addUser = addUser;


/* ------ Reservations ------ */

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const query = `
    WITH property_avg_rating AS (
      SELECT property_id,
             AVG(rating) AS average_rating
        FROM property_reviews
       GROUP BY property_id
    )

    SELECT *
      FROM users u
           LEFT JOIN reservations r ON u.id = r.guest_id
           LEFT JOIN properties p ON p.id = r.property_id
           LEFT JOIN property_avg_rating ar ON p.id = ar.property_id
     WHERE u.id = $1
     ORDER BY start_date
     LIMIT $2;
  `;
  const params = [guest_id, limit];

  return db
    .query(query, params)
    .then(res => res.rows)
    .catch(err => console.log(err.stack));
};
exports.getAllReservations = getAllReservations;


/* ------ Properties ------ */

/**
 * Helper function to construct multiple conditioned WHERE clause.
 * @param {string} query Existing query.
 * @param {string} condition Filter condition.
 * @returns {string} WHERE clause with filter condition either start with WHERE
 * or AND.
 */
const constructQueryFilter = (query, condition) => {
  return query.includes("WHERE") ?
    `AND ${condition}` :
    `WHERE ${condition}`;
}

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  let query = `
    WITH property_avg_rating AS (
      SELECT property_id,
             AVG(rating) AS average_rating
        FROM property_reviews
       GROUP BY property_id
    )

    SELECT *
      FROM properties p
           JOIN property_avg_rating ar ON p.id = ar.property_id
  `;

  const params = [];
  if (options?.city) {
    params.push(`%${options.city}%`);
    query += constructQueryFilter(query, `city ILIKE $${params.length}`)
  }

  if (options?.owner_id) {
    params.push(`${options.owner_id}`);
    query += constructQueryFilter(query, `owner_id = $${params.length}`);
  }

  if (options?.minimum_price_per_night) {
    params.push(`${options.minimum_price_per_night * 100}`);
    query += constructQueryFilter(query, `cost_per_night >= $${params.length}`);
  }

  if (options?.maximum_price_per_night) {
    params.push(`${options.maximum_price_per_night * 100}`);
    query += constructQueryFilter(query, `cost_per_night <= $${params.length}`);
  }

  if (options?.minimum_rating) {
    params.push(`${options.minimum_rating}`);
    query += constructQueryFilter(query, `average_rating >= $${params.length}`);
  }

  params.push(limit);
  query += `
    ORDER BY cost_per_night
    LIMIT $${params.length};
  `;

  return db
    .query(query, params)
    .then(res => res.rows)
    .catch(err => console.log(err.stack));
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const query = `
    INSERT INTO properties (
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      country,
      street,
      city,
      province,
      post_code,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  const params = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.country,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];
  
  return db
    .query(query, params)
    .then(res => res.rows[0])
    .catch(err => console.log(err.stack));
  };
exports.addProperty = addProperty;
