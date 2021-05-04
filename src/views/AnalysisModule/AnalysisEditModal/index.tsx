import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    randomString,
    listToMap,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    FaramActionElement,
    FaramList,
} from '@togglecorp/faram';
import {
    Button,
    Modal,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#utils/request';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import Icon from '#rscg/Icon';
import List from '#rscv/List';

import NonFieldErrors from '#rsci/NonFieldErrors';
import { flatten } from '#utils/common';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    AnalysisElement,
    MatrixTocElement,
    MultiResponse,
    FrameworkFields,
    UserMini,
    PillarFilterItem,
    AnalysisPillarFormItem,
    AnalysisPillars,
} from '#typings';

import _ts from '#ts';

import PillarAnalysisRow from './PillarAnalysisRow';
import styles from './styles.scss';

const FaramButton = FaramActionElement(Button);

const addAttribute = (attributes: AnalysisPillarFormItem[]) => ([
    ...attributes,
    {
        key: randomString(16),
    },
]);

interface AnalysisEditModalProps {
    className?: string;
    onSuccess: (value: AnalysisElement, isEditMode: boolean) => void;
    onModalClose: () => void;
    value?: AnalysisElement;
    projectId: number;
}

type AnalysisElementForm = Omit<AnalysisElement, 'analysisPillar'> & {
    analysisPillar: (Omit<AnalysisPillars, 'filters'> & { filters: string[] })[];
};

const analysisPillarKeySelector = (d: AnalysisPillars & { key: string }) => d.key;

const analysisSchema = {
    fields: {
        title: [requiredCondition],
        teamLead: [requiredCondition],
        analysisPillar: {
            keySelector: analysisPillarKeySelector,
            member: {
                fields: {
                    title: [requiredCondition],
                    assignee: [requiredCondition],
                    filters: [requiredCondition],
                },
            },
        },
    },
};

const userKeySelector = (u: UserMini) => u.id;
const userLabelSelector = (u: UserMini) => u.displayName;

const idSelector = (d: PillarFilterItem) => d.uniqueId;
const childrenSelector = (d: MatrixTocElement) => d.children;

const frameworkQueryFields = {
    fields: ['widgets', 'id'],
};

const usersQueryFields = {
    fields: ['display_name', 'id'],
};

function AnalysisEditModal(props: AnalysisEditModalProps) {
    const {
        className,
        onSuccess,
        onModalClose,
        value,
        projectId,
    } = props;

    const [faramValues, setFaramValues] = useState(() => {
        if (isNotDefined(value)) {
            return undefined;
        }
        const newValue = {
            ...value,
            analysisPillar: value?.analysisPillar?.map(ap => ({
                ...ap,
                // NOTE: This is done for maintaining unique key while operating items
                // on a list. We might need TODO work on this if we decide to use
                // UUID globally throughout DEEP
                key: randomString(16),
                filters: ap?.filters?.map(f => idSelector(f)),
            })),
        };
        return newValue;
    });
    const [faramErrors, setFaramErrors] = useState<unknown | undefined>();
    const [pristine, setPristine] = useState(true);

    const {
        pending: pendingFramework,
        response: framework,
    } = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('analysis.editModal', 'frameworkTitle'))({ error: errorBody });
        },
    });

    const matrixPillars = useMemo(
        () => flatten(
            [
                ...getMatrix1dToc(framework?.widgets),
                ...getMatrix2dToc(framework?.widgets),
            ],
            childrenSelector,
        ).filter((v: MatrixTocElement) => v.key),
        [framework],
    );

    const {
        pending: pendingUsersList,
        response: usersListResponse,
    } = useRequest<MultiResponse<UserMini>>({
        url: `server://projects/${projectId}/members/`,
        query: usersQueryFields,
        method: 'GET',
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis.editModal', 'usersTitle'))({ error: errorBody }),
    });

    const onFaramChange = useCallback((newValue, errors) => {
        setFaramValues(newValue);
        setFaramErrors(errors);
        setPristine(false);
    }, []);

    const onValidationFailure = useCallback((errors) => {
        setFaramErrors(errors);
        setPristine(true);
    }, []);

    const id = value?.id;
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
                onSuccess(response, isDefined(value));
            }
            onModalClose();
        },
        onFailure: (_, errorBody) => {
            setFaramErrors(errorBody?.faramErrors);
            notifyOnFailure(_ts('analysis.editModal', 'anaylsisEditModal'))({ error: errorBody });
        },
    });

    // FIXME: Use new form and write appropriate typings
    const onValidationSuccess = useCallback((finalValues: AnalysisElementForm) => {
        setPristine(true);
        const { analysisPillar } = finalValues;
        const matrixMap = listToMap(
            matrixPillars,
            idSelector,
            d => ({
                id: d.id,
                key: d.key,
                uniqueId: d.uniqueId,
            }),
        );
        const newAnalysisPillar = analysisPillar?.map(ap => ({
            ...ap,
            filters: ap?.filters?.map((f: string) => matrixMap[f]),
        }));
        triggerAnalysisEdit({
            ...finalValues,
            analysisPillar: newAnalysisPillar,
        });
    }, [triggerAnalysisEdit, matrixPillars]);

    const rowRendererParams = useCallback((key, data, index) => ({
        index,
        usersList: usersListResponse?.results ?? [],
        matrixPillars,
        data,
    }), [usersListResponse, matrixPillars]);

    return (
        <Modal
            className={_cs(styles.analysisEditModal, className)}
            heading={
                isDefined(value)
                    ? _ts('analysis.editModal', 'editAnalysisModalHeading')
                    : _ts('analysis.editModal', 'addAnalysisModalHeading')
            }
            onCloseButtonClick={onModalClose}
        >
            <Faram
                schema={analysisSchema}
                onChange={onFaramChange}
                onValidationSuccess={onValidationSuccess}
                onValidationFailure={onValidationFailure}
                value={faramValues}
                error={faramErrors}
                disabled={pendingUsersList || pendingFramework || pendingAnalysisEdit}
            >
                <NonFieldErrors
                    faramElement
                    persistent={false}
                />
                <TextInput
                    className={styles.input}
                    faramElementName="title"
                    label={_ts('analysis.editModal', 'analysisTitleLabel')}
                    placeholder={_ts('analysis.editModal', 'analysisTitlePlaceholder')}
                />
                <SelectInput
                    className={styles.input}
                    faramElementName="teamLead"
                    label={_ts('analysis.editModal', 'teamLeadLabel')}
                    placeholder={_ts('analysis.editModal', 'teamLeadPlaceholder')}
                    options={usersListResponse?.results}
                    keySelector={userKeySelector}
                    labelSelector={userLabelSelector}
                />
                <FaramList
                    faramElementName="analysisPillar"
                    keySelector={analysisPillarKeySelector}
                >
                    <NonFieldErrors
                        persistent={false}
                        faramElement
                    />
                    <List
                        faramElement
                        renderer={PillarAnalysisRow}
                        keySelector={analysisPillarKeySelector}
                        rendererParams={rowRendererParams}
                    />
                    <FaramButton
                        name={undefined}
                        faramElementName="add-button"
                        faramAction={addAttribute}
                        variant="tertiary"
                        icons={(
                            <Icon name="add" />
                        )}
                    >
                        {_ts('analysis.editModal', 'addAnAnalystButtonLabel')}
                    </FaramButton>
                </FaramList>
                <footer className={styles.footer}>
                    <Button
                        name={undefined}
                        variant="primary"
                        type="submit"
                        disabled={pristine || pendingAnalysisEdit}
                    >
                        {
                            isDefined(value)
                                ? _ts('analysis.editModal', 'editButtonLabel')
                                : _ts('analysis.editModal', 'createButtonLabel')
                        }
                    </Button>
                </footer>
            </Faram>
        </Modal>
    );
}

export default AnalysisEditModal;
