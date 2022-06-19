const properties = require('./json/properties.json');

require("dotenv").config();
const env = process.env;

const { Pool } = require("pg");

/* ------ Build Database Connection ------ */

const pool = new Pool({
  user: env.PG_USER,
  host: env.PG_HOST,
  database: env.PG_DATABASE,
  password: env.PG_PASSWORD,
  port: env.PG_PORT,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});


/* ------ Users ------ */

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  const value = [email.toLowerCase()];

  return pool
    .query(query, value)
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
  const value = [id];

  return pool
    .query(query, value)
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
  const values = [
    user.name,
    user.email,
    user.password
  ];

  return pool
    .query(query, values)
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
  const values = [guest_id, limit];

  return pool
    .query(query, values)
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

  const values = [];
  if (options?.city) {
    values.push(`%${options.city}%`);
    query += constructQueryFilter(query, `city ILIKE $${values.length}`)
  }

  if (options?.owner_id) {
    values.push(`${options.owner_id}`);
    query += constructQueryFilter(query, `owner_id = $${values.length}`);
  }

  if (options?.minimum_price_per_night) {
    values.push(`${options.minimum_price_per_night * 100}`);
    query += constructQueryFilter(query, `cost_per_night >= $${values.length}`);
  }

  if (options?.maximum_price_per_night) {
    values.push(`${options.maximum_price_per_night * 100}`);
    query += constructQueryFilter(query, `cost_per_night <= $${values.length}`);
  }

  if (options?.minimum_rating) {
    values.push(`${options.minimum_rating}`);
    query += constructQueryFilter(query, `average_rating >= $${values.length}`);
  }

  values.push(limit);
  query += `
    ORDER BY cost_per_night
    LIMIT $${values.length};
  `;

  return pool
    .query(query, values)
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
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
