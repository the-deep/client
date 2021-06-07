import React from 'react';
import {
    _cs,
    randomString,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    useForm,
    useFormArray,
    PartialForm as RawPartialForm,
    ObjectSchema,
    ArraySchema,
    requiredCondition,
    arrayCondition,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    TextInput,
    SelectInput,
    List,
} from '@the-deep/deep-ui';
import { IoAdd } from 'react-icons/io5';

import { useRequest, useLazyRequest } from '#utils/request';

import { flatten } from '#utils/common';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import NonFieldError from '#components/ui/NonFieldError';
import {
    AnalysisElement,
    MatrixTocElement,
    MultiResponse,
    FrameworkFields,
    UserMini,
} from '#typings';

import _ts from '#ts';

import PillarAnalysisRow, { PillarAnalysisFields, Props as PillarAnalysisProps } from './PillarAnalysisRow';
import styles from './styles.scss';

type PartialForm<T> = RawPartialForm<T, { key: string }>;
type AnalysisPillar = Partial<PillarAnalysisFields> & { key: string };

type FormType = {
    title?: string;
    teamLead?: UserMini['id'];
    analysisPillar?: AnalysisPillar[];
}

const analysisPillarKeySelector = (d: AnalysisPillar) => d.key;

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AnalysisPillarType = NonNullable<NonNullable<FormType['analysisPillar']>>[number];

type AnalysisPillarSchema = ObjectSchema<PartialForm<AnalysisPillarType>>;
type AnalysisPillarSchemaFields = ReturnType<AnalysisPillarSchema['fields']>;
const analysisPillarSchema: AnalysisPillarSchema = {
    fields: (): AnalysisPillarSchemaFields => ({
        key: [],
        title: [requiredCondition],
        assignee: [requiredCondition],
        filters: [requiredCondition, arrayCondition],
    }),
};

type AnalysisPillarListSchema = ArraySchema<PartialForm<AnalysisPillarType>>;
type AnalysisPillarListMember = ReturnType<AnalysisPillarListSchema['member']>;
const analysisPillarListSchema: AnalysisPillarListSchema = {
    keySelector: d => d.key,
    member: (): AnalysisPillarListMember => analysisPillarSchema,
};

const analysisFormSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredCondition],
        teamLead: [requiredCondition],
        analysisPillar: analysisPillarListSchema,
    }),
    validation: (value) => {
        if ((value?.analysisPillar?.length ?? 0) < 1) {
            return _ts('analysis.editModal', 'pillarAnalysisRequired');
        }
        return undefined;
    },
};

const defaultAnalysisFormValues: PartialForm<FormType> = {
    analysisPillar: [{ key: randomString(16) }],
};

const userKeySelector = (u: UserMini) => u.id;
const userLabelSelector = (u: UserMini) => u.displayName;
const childrenSelector = (d: MatrixTocElement) => d.children;

const frameworkQueryFields = { fields: ['widgets', 'id'] };
const usersQueryFields = { fields: ['display_name', 'id'] };

interface AnalysisEditModalProps {
    className?: string;
    onSuccess: (value: AnalysisElement, isEditMode: boolean) => void;
    onModalClose: () => void;
    value?: AnalysisElement;
    projectId: number;
}

function AnalysisEditModal(props: AnalysisEditModalProps) {
    const {
        className,
        onSuccess,
        onModalClose,
        value: initialValue,
        projectId,
    } = props;

    const [initialFormValue] = React.useState<PartialForm<FormType>>(
        isDefined(initialValue) ? ({
            teamLead: initialValue.teamLead,
            title: initialValue.title,
            analysisPillar: initialValue.analysisPillar.map(ap => ({
                key: String(ap.id),
                assignee: ap.assignee,
                filters: ap.filters ? ap.filters.map(f => f.uniqueId) : undefined,
                title: ap.title,
            })),
        }) : defaultAnalysisFormValues,
    );

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(initialFormValue, analysisFormSchema);

    const {
        pending: pendingFramework,
        response: framework,
    } = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        failureHeader: _ts('analysis.editModal', 'frameworkTitle'),
    });

    const matrixPillars: MatrixTocElement[] = React.useMemo(() => (
        flatten([
            ...getMatrix1dToc(framework?.widgets),
            ...getMatrix2dToc(framework?.widgets),
        ], childrenSelector).filter((v: MatrixTocElement) => v.key)
    ), [framework]);


    const {
        pending: pendingUsersList,
        response: usersListResponse,
    } = useRequest<MultiResponse<UserMini>>({
        url: `server://projects/${projectId}/members/`,
        query: usersQueryFields,
        method: 'GET',
        failureHeader: _ts('analysis.editModal', 'usersTitle'),
    });

    const id = initialValue?.id;
    const {
        pending: pendingAnalysisEdit,
        trigger: triggerAnalysisEdit,
    } = useLazyRequest<AnalysisElement, unknown>({
        url: isDefined(id)
            ? `server://projects/${projectId}/analysis/${id}/`
            : `server://projects/${projectId}/analysis/`,
        method: isDefined(id) ? 'PATCH' : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            if (response) {
                onSuccess(response, isDefined(initialValue));
            }
            onModalClose();
        },
        failureHeader: _ts('analysis.editModal', 'anaylsisEditModal'),
    });

    const {
        onValueChange: onRowChange,
        onValueRemove: onRowRemove,
    } = useFormArray('analysisPillar', onValueChange);

    const rowRendererParams: (
        key: string,
        data: Partial<PillarAnalysisFields>,
        index: number,
    ) => PillarAnalysisProps = React.useCallback(
        (key, data, index) => ({
            error: error?.fields?.analysisPillar?.members?.[key],
            index,
            matrixPillars,
            onChange: onRowChange as PillarAnalysisProps['onChange'],
            onRemove: onRowRemove,
            usersList: usersListResponse?.results ?? [],
            value: data,
        }),
        [usersListResponse, matrixPillars, error, onRowChange, onRowRemove],
    );

    type AnalysisPillarList = typeof value.analysisPillar;
    const handleAddRowButtonClick = React.useCallback(() => {
        const newRow: PartialForm<AnalysisPillarType> = { key: randomString(16) };
        onValueChange((oldValue: PartialForm<AnalysisPillarList>) => (
            [...(oldValue ?? []), newRow]
        ), 'analysisPillar' as const);
    }, [onValueChange]);

    const pending = pendingFramework || pendingUsersList;

    const handleSubmitButtonClick = React.useCallback(() => {
        const {
            errored,
            error: validationError,
            value: finalValue,
        } = validate();

        onErrorSet(validationError);

        if (!errored) {
            const matrixMap = listToMap(
                matrixPillars,
                d => d.uniqueId,
                d => ({
                    id: d.id,
                    key: d.key,
                    uniqueId: d.uniqueId,
                }),
            );
            triggerAnalysisEdit({
                ...finalValue,
                analysisPillar: finalValue?.analysisPillar?.map(ap => ({
                    ...ap,
                    filters: ap.filters?.map(f => matrixMap[f]),
                })),
            });
        } else {
            console.error(validationError);
        }
    }, [validate, onErrorSet, matrixPillars, triggerAnalysisEdit]);

    const apError = error?.fields?.analysisPillar;

    return (
        <Modal
            className={_cs(styles.analysisEditModal, className)}
            heading={
                isDefined(initialValue)
                    ? _ts('analysis.editModal', 'editAnalysisModalHeading')
                    : _ts('analysis.editModal', 'addAnalysisModalHeading')
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="primary"
                        disabled={pristine || pendingAnalysisEdit}
                        onClick={handleSubmitButtonClick}
                    >
                        {
                            isDefined(initialValue)
                                ? _ts('analysis.editModal', 'editButtonLabel')
                                : _ts('analysis.editModal', 'createButtonLabel')
                        }
                    </Button>
                </>
            )}
        >
            <NonFieldError error={error} />
            <TextInput
                className={styles.input}
                label={_ts('analysis.editModal', 'analysisTitleLabel')}
                name="title"
                placeholder={_ts('analysis.editModal', 'analysisTitlePlaceholder')}
                value={value.title}
                error={error?.fields?.title}
                disabled={pending}
                onChange={onValueChange}
            />
            <SelectInput
                className={styles.input}
                keySelector={userKeySelector}
                label={_ts('analysis.editModal', 'teamLeadLabel')}
                labelSelector={userLabelSelector}
                name="teamLead"
                options={usersListResponse?.results}
                placeholder={_ts('analysis.editModal', 'teamLeadPlaceholder')}
                value={value.teamLead}
                error={error?.fields?.teamLead}
                onChange={onValueChange}
                disabled={pending}
            />
            <div className={styles.analysisPillarListContainer}>
                <NonFieldError error={apError} />
                <div className={styles.analysisPillarList}>
                    <List
                        data={value.analysisPillar}
                        renderer={PillarAnalysisRow}
                        keySelector={analysisPillarKeySelector}
                        rendererParams={rowRendererParams}
                    />
                </div>
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        onClick={handleAddRowButtonClick}
                        icons={<IoAdd />}
                        variant="tertiary"
                    >
                        {_ts('analysis.editModal', 'addAnAnalystButtonLabel')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default AnalysisEditModal;
