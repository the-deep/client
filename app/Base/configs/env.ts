// NOTE: these may not be used
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'test';

export const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
export const isProd = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
export const isAlpha = process.env.REACT_APP_DEEP_ENVIRONMENT === 'alpha';
export const isStaging = process.env.REACT_APP_DEEP_ENVIRONMENT === 'staging';
export const isNightly = process.env.REACT_APP_DEEP_ENVIRONMENT === 'nightly';
export const isDev = !isBeta && !isProd && !isAlpha && !isNightly && !isStaging;
