/**
 * Token Merger Utility
 *
 * Merges light and dark design tokens for output using CSS light-dark() function.
 */

/**
 * Normalizes a token path by removing the 'dark' namespace segment.
 * Converts 'global.dark.background.color.100' → 'global.background.color.100'
 *
 * @param {Object} token - Style Dictionary token object
 * @returns {string} Normalized path without 'dark' segment
 */
function normalizeTokenPath(token) {
  const pathSegments = token.path.slice(); // Clone the path array

  // Remove 'dark' if it's the second segment (after 'global')
  if (pathSegments.length > 1 && pathSegments[1] === 'dark') {
    pathSegments.splice(1, 1);
  }

  return pathSegments.join('.');
}

/**
 * Gets the CSS variable name from a token path.
 *
 * @param {Object} token - Style Dictionary token object
 * @returns {string} CSS variable name (e.g., 'pf-t--global--background--color--100')
 */
function getTokenCSSName(token) {
  return token.name;
}

/**
 * Determines if a token is a background color token.
 *
 * @param {Object} token - Style Dictionary token object
 * @returns {boolean} True if token is a background color
 */
function isBackgroundColor(token) {
  const path = token.path.join('.');
  return path.includes('background.color');
}

/**
 * Determines if a token is a box shadow color token.
 *
 * @param {Object} token - Style Dictionary token object
 * @returns {boolean} True if token is a box shadow color
 */
function isBoxShadowColor(token) {
  const path = token.path.join('.');
  return path.includes('box-shadow.color') || path.includes('box.shadow.color');
}

/**
 * Resolves a token value, either preserving var() references or resolving to actual values.
 *
 * @param {Object} token - Style Dictionary token object
 * @param {Object} dictionary - Style Dictionary instance
 * @param {boolean} outputReferences - Whether to preserve var() references
 * @returns {string} Resolved token value
 */
function resolveTokenValue(token, dictionary, outputReferences) {
  if (!token) {
    return null;
  }

  // Get the value to check for references
  const valueToCheck = token.original ? token.original.value : token.value;

  // If outputReferences is true and the token has a reference, convert to var() format
  if (outputReferences && dictionary.usesReference(valueToCheck)) {
    // Check if value is already in var() format
    if (token.value && typeof token.value === 'string' && token.value.startsWith('var(')) {
      return token.value;
    }

    // Convert token reference {token.path} to CSS var format
    // Extract the reference path
    if (typeof valueToCheck === 'string') {
      const refMatch = valueToCheck.match(/\{([^}]+)\}/);
      if (refMatch) {
        const refPath = refMatch[1];
        // Convert path like "global.border.color.hover" to "pf-t--global--border--color--hover"
        const cssVarName = refPath.replace(/\./g, '--');
        return `var(--pf-t--${cssVarName})`;
      }
    }

    // If we couldn't parse the reference, return the value as-is
    return token.value || valueToCheck;
  }

  // Otherwise return the resolved value
  return token.value || valueToCheck;
}

/**
 * Gets a sensible default light value for a dark-only token.
 *
 * @param {Object} darkToken - The dark-only token
 * @param {string} darkValue - The resolved dark value
 * @returns {string} Appropriate light default value
 */
function getDefaultLightValue(darkToken, darkValue) {
  // Background colors: use transparent
  if (isBackgroundColor(darkToken)) {
    return 'transparent';
  }

  // Box shadow colors: use rgba(0, 0, 0, 0)
  if (isBoxShadowColor(darkToken)) {
    return 'rgba(0, 0, 0, 0)';
  }

  // For other tokens, duplicate the dark value (safest fallback)
  return darkValue;
}

/**
 * Determines if a token is a dark-only base token that should be output with its original name.
 * These are tokens with 'dark' as the second path segment (e.g., global.dark.background.color.100)
 *
 * @param {Object} token - Style Dictionary token object
 * @returns {boolean} True if token should be output with --dark-- in the name
 */
function isDarkOnlyBaseToken(token) {
  if (!token || !token.path) {
    return false;
  }
  // Check if token has 'dark' as second segment in path
  return token.path.length > 1 && token.path[1] === 'dark';
}

/**
 * Builds a map of light/dark token pairs indexed by normalized path.
 *
 * @param {Array} lightTokens - Array of light theme tokens
 * @param {Array} darkTokens - Array of dark theme tokens
 * @returns {Array} Array of token pair objects
 */
function buildTokenPairMap(lightTokens, darkTokens) {
  const pairMap = new Map();

  // Index light tokens by their path
  lightTokens.forEach(token => {
    const normalizedPath = normalizeTokenPath(token);
    pairMap.set(normalizedPath, {
      normalizedPath,
      normalizedName: token.name,
      light: token,
      dark: null
    });
  });

  // Match dark tokens to light tokens by normalized path
  darkTokens.forEach(token => {
    const normalizedPath = normalizeTokenPath(token);

    if (pairMap.has(normalizedPath)) {
      // Found a matching light token
      pairMap.get(normalizedPath).dark = token;
    } else {
      // Dark-only token
      pairMap.set(normalizedPath, {
        normalizedPath,
        normalizedName: token.name.replace(/--dark--/g, '--'),
        light: null,
        dark: token
      });
    }
  });

  // Convert map to array and sort alphabetically by name (reverse order to match current behavior)
  return Array.from(pairMap.values()).sort((a, b) => {
    return b.normalizedName.localeCompare(a.normalizedName);
  });
}

module.exports = {
  normalizeTokenPath,
  getTokenCSSName,
  isBackgroundColor,
  isBoxShadowColor,
  resolveTokenValue,
  getDefaultLightValue,
  buildTokenPairMap,
  isDarkOnlyBaseToken
};
