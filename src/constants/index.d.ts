import { Permission } from '../types/common';

declare const pathNames: { [key: string]: string };
declare const viewsAcl: { [key: string]: {
    hide?: (options: {
        isDevMode: boolean;
        isBeta: boolean;
        isProd: boolean;
        isAlpha: boolean;
        isStaging: boolean;
        isNightly: boolean;
        hasProjects: boolean;
        isLoggedIn: boolean;
        isAdmin: boolean;
        hasAssessmentTemplate: boolean;
        hasAssessmentTemplaten: boolean;
        pathKey: string;

        leadPermissions: Permission;
        entryPermissions: Permission;
        setupPermissions: Permission;
        exportPermissions: Permission;
        assessmentPermissions: Permission;

        accessZoomableImage: boolean | undefined;
        accessPrivateProject: boolean | undefined;
        accessQuestionnaire: boolean | undefined;
        accessNewUi: boolean | undefined;
        accessAnalysisModule: boolean | undefined;
        accessEntryVisualizationConfiguration: boolean | undefined;
    }) => boolean;
} };
// eslint-disable-next-line import/prefer-default-export
export { pathNames, viewsAcl };
