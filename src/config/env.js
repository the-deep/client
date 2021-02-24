export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'test';

export const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
export const isAlpha = process.env.REACT_APP_DEEP_ENVIRONMENT === 'alpha';
export const isNightly = process.env.REACT_APP_DEEP_ENVIRONMENT === 'nightly';
export const isDev = !isBeta && !isAlpha && !isNightly;

export const commitHash = process.env.REACT_APP_DEEP_COMMIT_SHA;

// _ts('components.navbar', 'betaLabel')
// _ts('components.navbar', 'alphaLabel')
// _ts('components.navbar', 'nightlyLabel')
// _ts('components.navbar', 'devLabel')
// _ts('home', 'betaLabel')
// _ts('home', 'alphaLabel')
// _ts('home', 'nightlyLabel')
// _ts('home', 'devLabel')
export const envText = (
    (isBeta && 'betaLabel') ||
    (isAlpha && 'alphaLabel') ||
    (isNightly && 'nightlyLabel') ||
    'devLabel'
);

