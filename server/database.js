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
    SELECT *
      FROM users u
           LEFT JOIN reservations r ON u.id = r.guest_id
           LEFT JOIN properties p ON p.id = r.property_id
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
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const query = "SELECT * FROM properties LIMIT $1";
  const value = [limit];

  return pool
    .query(query, value)
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
