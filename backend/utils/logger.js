// logger.js - Simple logging utility for Citi Dashboard Backend

/**
 * Log an info message
 * @param {string} message - The message to log
 * @param {Object} [data] - Additional data to log
 */
function info(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[INFO] [${timestamp}] ${message}`, data);
  } else {
    console.log(`[INFO] [${timestamp}] ${message}`);
  }
}

/**
 * Log a warning message
 * @param {string} message - The message to log
 * @param {Object} [data] - Additional data to log
 */
function warn(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.warn(`[WARN] [${timestamp}] ${message}`, data);
  } else {
    console.warn(`[WARN] [${timestamp}] ${message}`);
  }
}

/**
 * Log an error message
 * @param {string} message - The message to log
 * @param {Object} [data] - Additional data to log
 */
function error(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.error(`[ERROR] [${timestamp}] ${message}`, data);
  } else {
    console.error(`[ERROR] [${timestamp}] ${message}`);
  }
}

/**
 * Log a debug message
 * @param {string} message - The message to log
 * @param {Object} [data] - Additional data to log
 */
function debug(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[DEBUG] [${timestamp}] ${message}`, data);
    } else {
      console.log(`[DEBUG] [${timestamp}] ${message}`);
    }
  }
}

module.exports = {
  info,
  warn,
  error,
  debug
};
