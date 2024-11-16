export const myApp = process.env.MY_APP_ID;
export const appCommitHash = process.env.REACT_APP_COMMITHASH;

export const deepEnvironment = process.env.REACT_APP_DEEP_ENVIRONMENT || 'prod';
export const isDebugMode = process.env.REACT_APP_DEBUG_MODE?.toLowerCase() === 'false';

// Endpoints
// TODO: Make api endpoint environment variables consistent with protocol and domain
// TODO: Handle graphql and api endpoints similarly
export const apiHttps = process.env.REACT_APP_API_HTTPS || 'http';
export const apiEndpoint = process.env.REACT_APP_API_END as string; // localhost:8000
export const graphqlEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT as string; // http://localhost:8000/graphql
export const staticEndpoint = process.env.REACT_APP_STATIC_ENDPOINT as string;
export const serverlessEndpoint = process.env.REACT_APP_SERVERLESS_DOMAIN || 'https://services-local.thedeep.io';
// eslint-disable-next-line max-len
export const pdfCacheEndpoint = process.env.REACT_APP_PDF_CACHE_ENDPOINT as string; // localhost:8081

// Iframes
export const oldAryEndpoint = process.env.REACT_APP_ASSESSMENT_REGISTRY_END; // http://localhost:3100
export const aryVizEndpoint = process.env.REACT_APP_ASSESSMENT_VIZ_URL || 'https://the-deep.github.io/deepviz-assessments/';
export const entriesVizEndpoint = process.env.REACT_APP_ENTRY_VIZ_URL || 'https://the-deep.github.io/deepviz-entries/';

// Chrome extension
export const extensionId = process.env.REACT_APP_BROWSER_EXTENSION_ID || 'hkmakfhfikfhllpkfpkkaoonapclfajf';
export const extensionChromeUrl = `https://chrome.google.com/webstore/detail/deep/${extensionId}`;

// Zendesk
export const zendeskSupportUrl = 'https://deephelp.zendesk.com/hc/en-us';

// Mapbox
export const mapboxStyle = process.env.REACT_APP_MAPBOX_STYLE;
export const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as string;

// Sentry
export const sentryAppDsn = process.env.REACT_APP_SENTRY_DSN;
export const sentryTraceSampleRate = Number(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE) || 0.2;
export const sentryNormalizeDepth = Number(process.env.REACT_APP_SENTRY_NORMALIZE_DEPTH) || 5;

// Humanitarian ID
export const hidClientId = process.env.REACT_APP_HID_CLIENT_ID || 'deep-local';
export const hidRedirectUrl = process.env.REACT_APP_HID_CLIENT_REDIRECT_URL || 'http://localhost:3000/login/';
export const hidAuthUrl = process.env.REACT_APP_HID_AUTH_URI || 'https://api2.dev.humanitarian.id';

// Hcaptcha
export const hCaptchaKey = process.env.REACT_APP_HCATPCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';

// Google drive
export const driveDeveloperKey = process.env.REACT_APP_GOOGLE_DRIVE_DEVELOPER_KEY || 'AIzaSyDINvjHwIS_HHsb3qCgFm_2GFHKqEUwucE';
export const driveClientId = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_KEY || '642927279233-98drcidvhmudgv9dh70m7k66730n9rjr.apps.googleusercontent.com';
export const googleAnalyticsMeasurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
