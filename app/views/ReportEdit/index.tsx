import React, {
    useMemo,
    useState,
    useCallback,
    useRef,
} from 'react';
import {
    _cs,
    randomString,
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';
import {
    useParams,
    useHistory,
    generatePath,
} from 'react-router-dom';
import {
    useForm,
    removeNull,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useQuery,
    useMutation,
    gql,
} from '@apollo/client';
import {
    useAlert,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import BackLink from '#components/BackLink';
import routes from '#base/configs/routes';
import SubNavbar from '#components/SubNavbar';
import {
    BasicOrganization,
} from '#components/selections/NewOrganizationMultiSelectInput';
import {
    ORGANIZATION_FRAGMENT,
} from '#gqlFragments';

import {
    AnalysisReportInputType,
    PillarsForReportQuery,
    PillarsForReportQueryVariables,
    CreateReportMutation,
    CreateReportMutationVariables,
    UpdateReportMutation,
    UpdateReportMutationVariables,
    ReportDetailsQuery,
    ReportDetailsQueryVariables,
} from '#generated/types';
import {
    type ObjectError,
    transformToFormError,
} from '#base/utils/errorTransform';

import ReportBuilder from './ReportBuilder';
import Toc from './Toc';
import schema, {
    type PartialFormType,
    type ReportContainerType,
} from './schema';
import styles from './styles.css';

const TEXT_STYLE_FRAGMENT = gql`
    fragment TextStyle on AnalysisReportTextStyleType {
        align
        color
        family
        size
        weight
    }
`;

const PADDING_STYLE_FRAGMENT = gql`
    fragment PaddingStyle on AnalysisReportPaddingStyleType {
        top
        bottom
        right
        left
    }
`;

const BORDER_STYLE_FRAGMENT = gql`
    fragment BorderStyle on AnalysisReportBorderStyleType {
        color
        opacity
        style
        width
    }
`;

const PILLARS_FOR_REPORT = gql`
    query PillarsForReport(
        $projectId: ID!,
        $analysisId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysis(id: $analysisId) {
                id
                title
                pillars {
                    id
                    analyzedEntriesCount
                    informationGap
                    mainStatement
                    modifiedAt
                    title
                    filters
                    clientId
                    statements {
                        clientId
                        informationGaps
                        statement
                        reportText
                    }
                }
            }
        }
    }
`;

// NOTE: The same schema is being used to generate snapshot
// So, if we need to change anything here, lets change it in
// server/apps/common/schema_snapshots.py
// SnapshotQuery::AnalysisReport
const REPORT_DETAILS = gql`
    ${ORGANIZATION_FRAGMENT}
    ${TEXT_STYLE_FRAGMENT}
    ${BORDER_STYLE_FRAGMENT}
    ${PADDING_STYLE_FRAGMENT}
    query ReportDetails(
        $projectId: ID!,
        $reportId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisReport(
                id: $reportId,
            ) {
                id
                analysis
                title
                subTitle
                slug
                organizations {
                    ...OrganizationGeneralResponse
                }
                containers {
                    id
                    clientId
                    row
                    column
                    width
                    height
                    contentType
                    style {
                        border {
                            ...BorderStyle
                        }
                        padding {
                            ...PaddingStyle
                        }
                        background {
                            color
                            opacity
                        }
                    }
                    contentData {
                        clientId
                        data
                        id
                        upload {
                            id
                            file {
                                id
                                file {
                                    name
                                    url
                                }
                            }
                        }
                    }
                    contentConfiguration {
                        heading {
                            content
                            variant
                            style {
                                content {
                                    ...TextStyle
                                }
                            }
                        }
                        image {
                            altText
                            caption
                            style {
                                caption {
                                    ...TextStyle
                                }
                                fit
                            }
                        }
                        text {
                            content
                            style {
                                content {
                                    ...TextStyle
                                }
                            }
                        }
                        url {
                            url
                        }
                    }
                }
            }
        }
    }
`;

const CREATE_REPORT = gql`
    mutation CreateReport(
        $projectId: ID!,
        $data: AnalysisReportInputType!,
    ) {
        project(id: $projectId) {
            id
            analysisReportCreate(data: $data) {
                result {
                    id
                }
                errors
                ok
            }
        }
    }
`;

const UPDATE_REPORT = gql`
    mutation UpdateReport(
        $projectId: ID!,
        $reportId: ID!,
        $data: AnalysisReportInputUpdateType!,
    ) {
        project(id: $projectId) {
            id
            analysisReportUpdate(
                id: $reportId,
                data: $data,
            ) {
                result {
                    id
                }
                errors
                ok
            }
        }
    }
`;

export type ContentDataFileMap = Record<string, {
    url: string | undefined;
    name: string | undefined;
}>;

interface Props {
    className?: string;
}

function ReportEdit(props: Props) {
    const {
        className,
    } = props;

    const alert = useAlert();
    const history = useHistory();
    const leftContentRef = useRef<HTMLDivElement>(null);

    const {
        reportId,
        projectId,
    } = useParams<{
        reportId: string | undefined,
        projectId: string | undefined,
    }>();

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | null | undefined>();

    const [
        contentDataToFileMap,
        setContentDataToFileMap,
    ] = useState<ContentDataFileMap>();

    const analysisId = new URL(window.location.href).searchParams.get('analysis');

    const defaultValue: PartialFormType = useMemo(() => ({
        analysis: analysisId ?? undefined,
    }), [analysisId]);

    const analysisVariables = useMemo(() => {
        if (!analysisId || !projectId) {
            return undefined;
        }
        return {
            analysisId,
            projectId,
        };
    }, [analysisId, projectId]);

    const {
        value,
        pristine,
        validate,
        setError,
        setValue,
        error,
        setPristine,
        setFieldValue,
    } = useForm(
        schema,
        defaultValue,
    );

    const {
        loading: analysisDataLoading,
    } = useQuery<PillarsForReportQuery, PillarsForReportQueryVariables>(
        PILLARS_FOR_REPORT,
        {
            skip: !analysisId || !projectId || !!reportId,
            variables: analysisVariables,
            onCompleted: (response) => {
                if (!response.project?.analysis?.pillars) {
                    return;
                }
                const {
                    pillars,
                } = response.project.analysis;

                const containers: ReportContainerType[] = pillars.reduce((acc, item) => {
                    const header: ReportContainerType = {
                        clientId: randomString(),
                        row: acc.length + 1,
                        column: 1,
                        width: 12,
                        contentType: 'HEADING' as const,
                        contentConfiguration: {
                            heading: {
                                content: item.title,
                                variant: 'H2',
                            },
                        },
                    };

                    return ([
                        ...acc,
                        header,
                        ...(item?.statements ?? []).map((statement, statementIndex) => ({
                            clientId: randomString(),
                            row: acc.length + 1 + statementIndex + 1,
                            column: 1,
                            width: 12,
                            contentType: 'TEXT' as const,
                            contentConfiguration: {
                                text: {
                                    content: [
                                        '#### Main Statement',
                                        statement.statement,
                                        '#### Information Gaps',
                                        statement.informationGaps,
                                        '#### My Analysis',
                                        statement.reportText,
                                    ].join('\n'),
                                },
                            },
                        })),
                    ]);
                }, [{
                    clientId: randomString(),
                    row: 1,
                    column: 1,
                    width: 12,
                    contentType: 'HEADING' as const,
                    contentConfiguration: {
                        heading: {
                            content: response.project.analysis.title,
                            variant: 'H1',
                        },
                    },
                }] as ReportContainerType[]);

                setFieldValue(containers, 'containers');
            },
        },
    );

    const reportVariables = useMemo(() => (
        (projectId && reportId) ? {
            projectId,
            reportId,
        } : undefined
    ), [projectId, reportId]);

    const {
        loading: reportLoading,
    } = useQuery<ReportDetailsQuery, ReportDetailsQueryVariables>(
        REPORT_DETAILS,
        {
            skip: !projectId || !reportId,
            variables: reportVariables,
            onCompleted: (response) => {
                if (!response.project?.analysisReport) {
                    alert.show(
                        'Failed to load analysis report.',
                        { variant: 'error' },
                    );
                    return;
                }
                const valueToSet = removeNull(response.project.analysisReport);
                const newContainers = [...(valueToSet?.containers ?? [])];
                newContainers.sort((a, b) => (
                    compareNumber(a.row, b.row) || compareNumber(a.column, b.column)
                ));
                setValue(
                    {
                        ...valueToSet,
                        organizations: valueToSet.organizations?.map((item) => item.id),
                        containers: newContainers?.map((item) => ({
                            ...item,
                            contentData: item.contentData?.map((contentDataItem) => ({
                                ...contentDataItem,
                                upload: contentDataItem.upload.id,
                            })),
                        })),
                    },
                );
                const uploadItems = valueToSet.containers?.map((item) => item.contentData).flat();
                setContentDataToFileMap(listToMap(
                    uploadItems,
                    (item) => item.clientId,
                    (item) => ({
                        name: item.upload.file.file?.name,
                        url: item.upload.file.file?.url,
                    }),
                ));
                setOrganizationOptions(valueToSet.organizations);
            },
        },
    );

    const [
        triggerCreate,
        {
            loading: createReportLoading,
        },
    ] = useMutation<CreateReportMutation, CreateReportMutationVariables>(
        CREATE_REPORT,
        {
            onCompleted: (response) => {
                if (!response || !response.project?.analysisReportCreate) {
                    return;
                }
                const {
                    errors,
                    result,
                    ok,
                } = response.project.analysisReportCreate;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to create analysis report.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    if (result?.id) {
                        const editPath = generatePath(
                            routes.reportEdit.path,
                            {
                                projectId,
                                reportId: result.id,
                            },
                        );
                        history.replace(editPath);
                    }
                    alert.show(
                        'Successfully created report.',
                        { variant: 'success' },
                    );
                }
            },
        },
    );

    const [
        triggerUpdate,
        {
            loading: updateReportLoading,
        },
    ] = useMutation<UpdateReportMutation, UpdateReportMutationVariables>(
        UPDATE_REPORT,
        {
            onCompleted: (response) => {
                if (!response || !response.project?.analysisReportUpdate) {
                    return;
                }
                const {
                    errors,
                    ok,
                } = response.project.analysisReportUpdate;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to update analysis report.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    setPristine(true);
                    alert.show(
                        'Successfully update report.',
                        { variant: 'success' },
                    );
                }
            },
        },
    );

    const tableOfContents = useMemo(() => (
        value?.containers?.filter((item) => item.contentType === 'HEADING')
    ), [value?.containers]);

    const handleSubmit = useCallback(
        (val: PartialFormType) => {
            if (!projectId) {
                return;
            }
            if (!reportId) {
                triggerCreate({
                    variables: {
                        projectId,
                        data: val as AnalysisReportInputType,
                    },
                });
            } else {
                triggerUpdate({
                    variables: {
                        projectId,
                        reportId,
                        data: val as AnalysisReportInputType,
                    },
                });
            }
        },
        [
            triggerUpdate,
            reportId,
            triggerCreate,
            projectId,
        ],
    );

    const pending = analysisDataLoading
        || reportLoading
        || createReportLoading
        || updateReportLoading;

    const [
        contentEditPaneVisible,
        setContentEditPaneVisibility,
    ] = useState(false);

    return (
        <div className={_cs(className, styles.reportEdit)}>
            <SubNavbar
                className={styles.header}
                heading="New Report"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            Back
                        </BackLink>
                        <Button
                            name={undefined}
                            onClick={createSubmitHandler(
                                validate,
                                setError,
                                handleSubmit,
                            )}
                            disabled={pristine}
                            variant="primary"
                        >
                            Save
                        </Button>
                    </>
                )}
            />
            <div className={styles.content}>
                {pending && <PendingMessage />}
                <div
                    className={_cs(
                        styles.leftContent,
                        contentEditPaneVisible && styles.large,
                    )}
                >
                    {!contentEditPaneVisible && (
                        <Toc
                            data={tableOfContents}
                        />
                    )}
                    <div
                        ref={leftContentRef}
                        className={styles.editContent}
                    />
                </div>
                <ReportBuilder
                    className={styles.rightContent}
                    value={value}
                    error={error}
                    setFieldValue={setFieldValue}
                    disabled={false}
                    readOnly={false}
                    organizationOptions={organizationOptions}
                    onOrganizationOptionsChange={setOrganizationOptions}
                    contentDataToFileMap={contentDataToFileMap}
                    setContentDataToFileMap={setContentDataToFileMap}
                    leftContentRef={leftContentRef}
                    onContentEditChange={setContentEditPaneVisibility}
                />
            </div>
        </div>
    );
}

export default ReportEdit;
