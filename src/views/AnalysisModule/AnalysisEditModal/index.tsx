import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    randomString,
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

import useRequest from '#utils/request';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import Icon from '#rscg/Icon';
import List from '#rscv/List';

import NonFieldErrors from '#rsci/NonFieldErrors';
import { flatten } from '#utils/common';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    PillarAnalysisElement,
    AnalysisElement,
    MatrixTocElement,
    MultiResponse,
    FrameworkFields,
    UserMini,
} from '#typings';

import _ts from '#ts';

import PillarAnalysisRow from './PillarAnalysisRow';
import styles from './styles.scss';

const FaramButton = FaramActionElement(Button);

const addAttribute = attributes => ([
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

const analysisPillarKeySelector = (d: PillarAnalysisElement & { key: string }) => d.key;

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
            })),
        };
        return newValue;
    });
    const [faramErrors, setFaramErrors] = useState();
    const [pristine, setPristine] = useState(true);
    const [bodyToSend, setBodyToSend] = useState(undefined);

    const [
        pendingFramework,
        framework,
    ] = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        autoTrigger: true,
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

    const [
        pendingUsersList,
        usersListResponse,
    ] = useRequest<MultiResponse<UserMini>>({
        url: `server://projects/${projectId}/members/`,
        query: usersQueryFields,
        method: 'GET',
        autoTrigger: true,
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

    const [
        pendingAnalysisEdit,
        ,
        ,
        triggerAnalysisEdit,
    ] = useRequest<AnalysisElement>({
        url: isDefined(value)
            ? `server://projects/${projectId}/analysis/${value.id}/`
            : `server://projects/${projectId}/analysis/`,
        method: isDefined(value) ? 'PATCH' : 'POST',
        body: bodyToSend,
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

    const onValidationSuccess = useCallback((finalValues) => {
        setPristine(true);
        setBodyToSend(finalValues);
        triggerAnalysisEdit();
    }, [triggerAnalysisEdit]);

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
            onClose={onModalClose}
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
