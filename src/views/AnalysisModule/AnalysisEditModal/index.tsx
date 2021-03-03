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

import useRequest from '#utils/request';
import Modal from '#dui/Modal';
import Button from '#dui/Button';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import Icon from '#rscg/Icon';
import List from '#rscv/List';

import { flatten } from '#utils/common';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import { notifyOnFailure } from '#utils/requestNotify';
import {
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
    onModalClose: () => void;
    // TODO
    value?: unknown;
    projectId: number;
}

const analysisSchema = {
    fields: {
        title: [requiredCondition],
        teamLead: [requiredCondition],
        analysisPillar: [],
    },
};

const userKeySelector = (u: UserMini) => u.id;
const userLabelSelector = (u: UserMini) => u.displayName;

const childrenSelector = (d: MatrixTocElement) => d.children;
const analysisPillarKeySelector = d => d.key;

function AnalysisEditModal(props: AnalysisEditModalProps) {
    const {
        className,
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
        query: {
            fields: ['widgets', 'id'],
        },
        autoTrigger: true,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis.editModal', 'frameworkTitle'))({ error: errorBody }),
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
        query: {
            fields: ['id', 'display_name'],
        },
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
        setPristine(true);
    }, []);

    const [
        pendingAnalysisEdit,
        ,
        ,
        triggerAnalysisEdit,
    ] = useRequest<Partial<FrameworkFields>>({
        url: isDefined(value)
            ? `server://projects/${projectId}/analysis/${value.id}/`
            : `server://projects/${projectId}/analysis/`,
        method: isDefined(value) ? 'PATCH' : 'POST',
        body: bodyToSend,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analysis.editModal', 'anaylsisEditModal'))({ error: errorBody }),
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
            heading={_ts('analysis.editModal', 'addAnalysisModalHeading')}
            onClose={onModalClose}
        >
            <Faram
                schema={analysisSchema}
                onChange={onFaramChange}
                onValidationSuccess={onValidationSuccess}
                onValidationFailure={onValidationFailure}
                value={faramValues}
                error={faramErrors}
                disabled={pendingUsersList || pendingFramework}
            >
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
                        disabled={pristine}
                    >
                        {_ts('analysis.editModal', 'createButtonLabel')}
                    </Button>
                </footer>
            </Faram>
        </Modal>
    );
}

export default AnalysisEditModal;
