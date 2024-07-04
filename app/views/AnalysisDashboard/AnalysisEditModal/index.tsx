import React, {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    _cs,
    randomString,
    isDefined,
    compareDate,
} from '@togglecorp/fujs';
import {
    useForm,
    useFormArray,
    PartialForm as RawPartialForm,
    ObjectSchema,
    ArraySchema,
    requiredCondition,
    getErrorObject,
    requiredStringCondition,
    defaultUndefinedType,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useAlert,
    Button,
    Modal,
    TextInput,
    SelectInput,
    DateInput,
    ListView,
} from '@the-deep/deep-ui';
import { IoAdd } from 'react-icons/io5';
import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';

import { ProjectContext } from '#base/context/ProjectContext';
import { flatten } from '#utils/common';
import NonFieldError from '#components/NonFieldError';

import {
    AnalysisDetailQuery,
    AnalysisDetailQueryVariables,
    AnalysisInputType,
    FrameworkDetailsForAnalysisQuery,
    FrameworkDetailsForAnalysisQueryVariables,
    UpdateAnalysisMutation,
    UpdateAnalysisMutationVariables,
    UserMembersQuery,
    UserMembersQueryVariables,
} from '#generated/types';

import _ts from '#ts';
import { FRAMEWORK_FRAGMENT } from '#gqlFragments';

import {
    getMatrixPillars,
    MatrixPillar,
} from './utils';

import PillarAnalysisRow, { Props as PillarAnalysisProps } from './PillarAnalysisRow';
import styles from './styles.css';

const FRAMEWORK_DETAILS_FOR_ANALYSIS = gql`
    ${FRAMEWORK_FRAGMENT}
    query FrameworkDetailsForAnalysis($projectId: ID!) {
        project(id: $projectId) {
            id
            analysisFramework {
                # NOTE: Does not need predictionTagsMapping from FrameworkResponse
                ...FrameworkResponse
            }
        }
    }
`;

const UPDATE_ANALYSIS = gql`
    mutation UpdateAnalysis(
        $projectId: ID!,
        $data: AnalysisInputType!,
        $analysisId: ID!,
    ) {
        project(id: $projectId) {
            analysisUpdate(
                id: $analysisId,
                data: $data,
            ) {
                ok
                errors
                result {
                    id
                    title
                    endDate
                    startDate
                    pillars {
                        assignee {
                            id
                            displayName
                            emailDisplay
                        }
                        analysisId
                        clientId
                        title
                        filters {
                            id
                            key
                            uniqueId
                        }
                    }
                    teamLead {
                        id
                        displayName
                        emailDisplay
                    }
                }
            }
        }
    }
`;

const ANALYSIS_DETAIL = gql`
    query AnalysisDetail(
        $projectId: ID!,
        $analysisId: ID!,
    ) {
        project(id: $projectId) {
            analysis(id: $analysisId) {
                id
                title
                teamLead {
                    id
                    displayName
                    emailDisplay
                }
                startDate
                endDate
                pillars {
                    title
                    analysisId
                    clientId
                    assignee {
                        id
                        emailDisplay
                        displayName
                    }
                    filters {
                        id
                        key
                        uniqueId
                    }
                }
            }
        }
    }
`;

const USER_MEMBERS = gql`
    query UserMembers(
        $projectId: ID!,
    ){
        project(id: $projectId) {
            userMembers {
                results {
                    member {
                        displayName
                        id
                    }
                    id
                    clientId
                }
            }
        }
    }
`;

type PartialForm<T> = RawPartialForm<T, 'clientId'>;
export type AnalysisPillar = NonNullable<NonNullable<NonNullable<NonNullable<UpdateAnalysisMutation['project']>['analysisUpdate']>['result']>['pillars']>[number];
export type AnalysisPillarForm = Omit<AnalysisPillar, 'assignee' | 'filters'> & {
    assignee: string,
    filters: MatrixPillar['uniqueId'][],
};
export type UserMembersType = NonNullable<NonNullable<NonNullable<UserMembersQuery['project']>['userMembers']>['results']>[number];
const analysisPillarKeySelector = (analysis: AnalysisPillarForm) => analysis.clientId;

type FormType = {
    title?: string;
    teamLead?: string;
    startDate?: string;
    endDate: string;
    analysisPillar?: AnalysisPillarForm[];
}

type PartialFormType = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AnalysisPillarType = NonNullable<NonNullable<FormType['analysisPillar']>>[number];

type AnalysisPillarSchema = ObjectSchema<PartialForm<AnalysisPillarType>, PartialFormType>;
type AnalysisPillarSchemaFields = ReturnType<AnalysisPillarSchema['fields']>;
const analysisPillarSchema: AnalysisPillarSchema = {
    fields: (): AnalysisPillarSchemaFields => ({
        clientId: [defaultUndefinedType],
        title: [requiredStringCondition],
        assignee: [requiredCondition],
        filters: [],
    }),
};

type AnalysisPillarListSchema = ArraySchema<PartialForm<AnalysisPillarType>, PartialFormType>;
type AnalysisPillarListMember = ReturnType<AnalysisPillarListSchema['member']>;

const analysisPillarListSchema: AnalysisPillarListSchema = {
    keySelector: (pillar) => pillar.clientId,
    member: (): AnalysisPillarListMember => analysisPillarSchema,
};

const analysisFormSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        teamLead: [requiredCondition],
        startDate: [],
        endDate: [requiredCondition],
        analysisPillar: analysisPillarListSchema,
    }),
    validation: (value) => {
        const errors = [];
        if ((value?.analysisPillar?.length ?? 0) < 1) {
            errors.push(_ts('analysis.editModal', 'pillarAnalysisRequired'));
        }
        if (isDefined(value?.startDate)) {
            if ((compareDate(value?.startDate, value?.endDate) > 0)) {
                errors.push(_ts('analysis.editModal', 'endDateGreaterThanStartDate'));
            }
        }
        return errors.length > 0
            ? errors.join(' ')
            : undefined;
    },
};

const defaultAnalysisFormValues: PartialForm<FormType> = {
    analysisPillar: [{ clientId: randomString(16) }],
};

const userKeySelector = (user: UserMembersType) => user.member.id;
const userLabelSelector = (user: UserMembersType) => user.member.displayName ?? '';
const childrenSelector = (user: MatrixPillar) => user.children;

interface AnalysisEditModalProps {
    className?: string;
    onSuccess: () => void;
    onModalClose: () => void;
    analysisToEdit: string;
    projectId: string;
}

function AnalysisEditModal(props: AnalysisEditModalProps) {
    const {
        className,
        onSuccess,
        onModalClose,
        analysisToEdit,
        projectId,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(analysisFormSchema, defaultAnalysisFormValues);

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.analysisPillar);

    const {
        project,
    } = useContext(ProjectContext);

    const frameworkVariables = useMemo(
        (): FrameworkDetailsForAnalysisQueryVariables | undefined => (
            (project) ? ({
                projectId: project.id,
            }) : undefined),
        [project],
    );

    const {
        loading: pendingFramework,
        data: projectWithFramework,
    } = useQuery<FrameworkDetailsForAnalysisQuery, FrameworkDetailsForAnalysisQueryVariables>(
        FRAMEWORK_DETAILS_FOR_ANALYSIS,
        {
            variables: frameworkVariables,
        },
    );

    const matrixPillars: MatrixPillar[] = React.useMemo(() => {
        const framework = projectWithFramework?.project?.analysisFramework;
        const widgetsFromPrimary = framework?.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = framework?.secondaryTagging ?? [];
        const allWidgets = [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ];
        const matrixItems = getMatrixPillars(allWidgets);
        return flatten(matrixItems, (item) => item, childrenSelector)
            .filter((item) => isDefined(item.key));
    }, [projectWithFramework]);

    const alert = useAlert();

    const {
        loading: analysisDetailLoading,
    } = useQuery<AnalysisDetailQuery, AnalysisDetailQueryVariables>(
        ANALYSIS_DETAIL,
        {
            variables: {
                projectId,
                analysisId: analysisToEdit,
            },
            onCompleted: (response) => {
                const {
                    analysis,
                } = response?.project || {};
                if (!analysis) {
                    return;
                }

                const formData: PartialForm<FormType> = {
                    title: analysis.title,
                    startDate: analysis?.startDate || undefined,
                    endDate: analysis?.endDate,
                    teamLead: analysis.teamLead.id,
                    analysisPillar: analysis.pillars?.map((pillar: AnalysisPillar) => ({
                        analysisId: pillar.analysisId,
                        clientId: pillar.clientId,
                        title: pillar.title,
                        assignee: pillar.assignee.id,
                        filters: pillar.filters?.map((item) => item.uniqueId).filter(isDefined),
                    })),
                };
                setValue(formData);
            },
        },
    );

    const variables = useMemo(
        (): UserMembersQueryVariables | undefined => (
            (project) ? ({
                projectId,
            }) : undefined),
        [project, projectId],
    );

    const {
        data: usersListResponse,
        loading: pendingUsersList,
    } = useQuery<UserMembersQuery, UserMembersQueryVariables>(
        USER_MEMBERS,
        {
            variables,
        },
    );

    const [
        triggerAnalysisEdit,
        { loading: UpdateAnalysisPending },
    ] = useMutation<UpdateAnalysisMutation, UpdateAnalysisMutationVariables>(
        UPDATE_ANALYSIS,
        {
            refetchQueries: [
                {
                    query: ANALYSIS_DETAIL,
                    variables: {
                        projectId,
                        analysisId: analysisToEdit,
                    },
                }],
            onCompleted: (response) => {
                const updateDraftAnalysisResponse = response?.project?.analysisUpdate;
                if (!response) {
                    return;
                }
                if (updateDraftAnalysisResponse?.ok) {
                    onSuccess();
                    alert.show(
                        'Successfully changed the analysis.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to change the analysis.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to change the analysis.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const pending = pendingFramework || pendingUsersList
        || UpdateAnalysisPending || analysisDetailLoading;

    const {
        setValue: onRowChange,
        removeValue: onRowRemove,
    } = useFormArray('analysisPillar', setFieldValue);

    const rowRendererParams: (
        key: string,
        data: Partial<AnalysisPillarForm>,
        index: number,
    ) => PillarAnalysisProps = React.useCallback(
        (id, data, index) => ({
            error: arrayError?.[id],
            index,
            matrixPillars,
            onChange: onRowChange as PillarAnalysisProps['onChange'],
            onRemove: onRowRemove,
            pending,
            usersList: usersListResponse?.project?.userMembers?.results ?? [],
            value: data,
        }),
        [
            matrixPillars,
            arrayError,
            onRowChange,
            onRowRemove,
            pending,
            usersListResponse,
        ],
    );

    const handleSubmitButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const cleanedData = {
                    ...val,
                    analysisPillar: val.analysisPillar?.map((pillar) => ({
                        ...pillar,
                        assignee: pillar.assignee,
                        clientId: pillar.clientId,
                    })),
                } as unknown as AnalysisInputType;
                triggerAnalysisEdit({
                    variables: {
                        data: cleanedData,
                        projectId,
                        analysisId: analysisToEdit,
                    },
                });
            },
        );
        submit();
    }, [
        validate,
        setError,
        triggerAnalysisEdit,
        projectId,
        analysisToEdit,
    ]);

    type AnalysisPillarList = typeof value.analysisPillar;
    const handleAddRowButtonClick = React.useCallback(() => {
        const newRow: PartialForm<AnalysisPillarType> = { clientId: randomString(16) };
        setFieldValue((oldValue: PartialForm<AnalysisPillarList>) => (
            [...(oldValue ?? []), newRow]
        ), 'analysisPillar' as const);
    }, [setFieldValue]);

    const apError = error?.analysisPillar;

    return (
        <Modal
            className={_cs(styles.analysisEditModal, className)}
            heading={
                isDefined(analysisToEdit)
                    ? _ts('analysis.editModal', 'editAnalysisModalHeading')
                    : _ts('analysis.editModal', 'addAnalysisModalHeading')
            }
            onCloseButtonClick={onModalClose}
            size="large"
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    variant="primary"
                    disabled={pristine}
                    onClick={handleSubmitButtonClick}
                >
                    {
                        isDefined(analysisToEdit)
                            ? _ts('analysis.editModal', 'editButtonLabel')
                            : _ts('analysis.editModal', 'createButtonLabel')
                    }
                </Button>
            )}
        >
            {/*
                NOTE: Set delay to 0 as it needs to be blocked
            */}
            <NonFieldError error={error} />
            <TextInput
                label={_ts('analysis.editModal', 'analysisTitleLabel')}
                name="title"
                placeholder={_ts('analysis.editModal', 'analysisTitlePlaceholder')}
                value={value.title}
                error={error?.title}
                disabled={pending}
                onChange={setFieldValue}
            />
            <SelectInput
                keySelector={userKeySelector}
                label={_ts('analysis.editModal', 'teamLeadLabel')}
                labelSelector={userLabelSelector}
                name="teamLead"
                options={usersListResponse?.project?.userMembers?.results}
                placeholder={_ts('analysis.editModal', 'teamLeadPlaceholder')}
                value={value.teamLead}
                error={error?.teamLead}
                onChange={setFieldValue}
                disabled={pending}
            />
            <DateInput
                name="startDate"
                label={_ts('analysis.editModal', 'startDateLabel')}
                value={value.startDate}
                onChange={setFieldValue}
                error={error?.startDate}
                disabled={pending}
            />
            <DateInput
                name="endDate"
                label={_ts('analysis.editModal', 'endDateLabel')}
                value={value.endDate}
                onChange={setFieldValue}
                error={error?.endDate}
                disabled={pending}
            />
            <div className={styles.analysisPillarListContainer}>
                <NonFieldError error={apError} />
                <ListView
                    className={styles.analysisPillarList}
                    data={value.analysisPillar}
                    renderer={PillarAnalysisRow}
                    keySelector={analysisPillarKeySelector}
                    rendererParams={rowRendererParams}
                    pending={pendingUsersList}
                    filtered={false}
                    errored={false}
                />
                <Button
                    className={styles.actionButton}
                    name={undefined}
                    onClick={handleAddRowButtonClick}
                    icons={<IoAdd />}
                    variant="tertiary"
                    disabled={pending}
                >
                    {_ts('analysis.editModal', 'addAnAnalystButtonLabel')}
                </Button>
            </div>
        </Modal>
    );
}

export default AnalysisEditModal;
