/* ============================================================
   LOGGER
   Simple colored console logger
   ============================================================ */

const colors = {
  reset:  "\x1b[0m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  blue:   "\x1b[36m",
  dim:    "\x1b[2m",
};

const timestamp = () => new Date().toISOString();

export const logger = {
  info:    (...args) => console.log(`${colors.blue}[INFO]${colors.reset}  ${colors.dim}${timestamp()}${colors.reset}`, ...args),
  success: (...args) => console.log(`${colors.green}[OK]${colors.reset}    ${colors.dim}${timestamp()}${colors.reset}`, ...args),
  warn:    (...args) => console.warn(`${colors.yellow}[WARN]${colors.reset}  ${colors.dim}${timestamp()}${colors.reset}`, ...args),
  error:   (...args) => console.error(`${colors.red}[ERROR]${colors.reset} ${colors.dim}${timestamp()}${colors.reset}`, ...args),
  debug:   (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${colors.dim}[DEBUG] ${timestamp()}${colors.reset}`, ...args);
    }
  },
};

export default logger;