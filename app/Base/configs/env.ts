export const myApp = process.env.MY_APP;
export const nodeEnv = process.env.NODE_ENV;
export const deepEnvironment = process.env.REACT_APP_DEEP_ENVIRONMENT;
export const apiEndpoint = process.env.REACT_APP_API_END as string;
export const deeplEndpoint = process.env.REACT_APP_DEEPL_END;
export const serverlessEndpoint = process.env.REACT_APP_SERVERLESS_DOMAIN;
export const apiHttps = process.env.REACT_APP_API_HTTPS;
export const graphqlEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT as string;

export const isDevelopment = nodeEnv === 'development';
export const isProduction = nodeEnv === 'production';
export const isTesting = nodeEnv === 'test';
export const isDev = !isProduction && !isDevelopment && !isTesting;

export const mapboxStyle = process.env.REACT_APP_MAPBOX_STYLE;
export const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as string;

export const oldAryEndpoint = process.env.REACT_APP_ASSESSMENT_REGISTRY_END;
export const aryVizEndpoint = process.env.REACT_APP_ASSESSMENT_VIZ_URL || 'https://the-deep.github.io/deepviz-assessments/';
export const entriesVizEndpoint = process.env.REACT_APP_ENTRY_VIZ_URL || 'https://the-deep.github.io/deepviz-entries/';

const extensionIdOnChromeStore = 'kafonkgglonkbldmcigbdojiadfcmcdc';
export const extensionId = process.env.REACT_APP_BROWSER_EXTENSION_ID || extensionIdOnChromeStore;

export const gaTrackingKey = process.env.REACT_APP_GA_TRACKING_ID || 'UA-112330910-2';
export const appCommitHash = process.env.REACT_APP_COMMITHASH;
export const appName = myApp;
export const sentryAppDsn = process.env.REACT_APP_SENTRY_DSN;

export const hidClientId = process.env.REACT_APP_HID_CLIENT_ID || 'deep-local';
export const hidRedirectUrl = process.env.REACT_APP_HID_CLIENT_REDIRECT_URL || 'http://localhost:3000/login/';
export const hidAuthUrl = process.env.REACT_APP_HID_AUTH_URI || 'https://api2.dev.humanitarian.id';

export const hCaptchaKey = process.env.REACT_APP_HCATPCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';
