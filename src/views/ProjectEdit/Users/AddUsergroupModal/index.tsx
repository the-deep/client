import React, { useState, useCallback } from 'react';

import { isDefined } from '@togglecorp/fujs';

import Faram, {
    requiredCondition,
    FaramList,
} from '@togglecorp/faram';

import {
    Button,
    Modal,
} from '@the-deep/deep-ui';

import useRequest from '#utils/request';
import SelectInput from '#rsci/SelectInput';

import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
}

const usergroupSchema = {
    fields: {
        project: [requiredCondition],
        userGroup: [requiredCondition],
        role: [requiredCondition],
        addedBy: [],
    },
};

function AddUsergroupModal(props: Props) {
    const {
        onModalClose,
    } = props;

    const [faramValues, setFaramValues] = useState(undefined);
    const [faramErrors, setFaramErrors] = useState();
    const [pristine, setPristine] = useState(true);
    const [bodyToSend, setBodyToSend] = useState(undefined);

    const [
        pendingAddUsergroup,
        userGroupResponse,
        ,
        ,
    ] = useRequest<MultiResponse>({
        url: `server://projects/${projectId}project-usergroups/`,
        method: 'GET',
        autoTrigger: true,
        onSuccess: (response) => {
            console.warn('yayyy', response);
        },
        onFailure: (_, errorBody) => {
            setFaramErrors(errorBody?.faramErrors);
        },
    });

    const onFaramChange = useCallback((newValue, errors) => {
        setFaramValues(newValue);
        setFaramErrors(errors);
    }, []);

    const onValidationFailure = useCallback((errors) => {
        setFaramErrors(errors);
    }, []);

    const onValidationSuccess = useCallback((finalValues) => {
        setPristine(true);
        setBodyToSend(finalValues);
    }, []);

    return (
        <Modal
            heading="Add Usergroup"
            onClose={onModalClose}
        >
            <Faram
                schema={usergroupSchema}
                onChange={onFaramChange}
                onValidationSuccess={onValidationSuccess}
                onValidationFailure={onValidationFailure}
                value={faramValues}
                error={faramErrors}
            >
                <SelectInput
                    className={styles.input}
                    faramElementName="project"
                    label="Select Usergroup"
                    placeholder="Select Usergroup"
                    options={}
                />
            </Faram>
        </Modal>
    );
}

export default AddUsergroupModal;
