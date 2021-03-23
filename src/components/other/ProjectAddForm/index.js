/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import Faram, { requiredCondition } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Cloak from '#components/general/Cloak';
import useRequest from '#utils/request';
import {
    setProjectAction,
    setUserProjectAction,
    setUsergroupViewProjectAction,
} from '#redux';
import _ts from '#ts';
import notify from '#notify';
import { notifyOnFailure } from '#utils/requestNotify';

import styles from './styles.scss';

// Note: Key is set according to is_private option
const projectVisibilityOptions = [
    { key: false, label: _ts('components.addProject', 'visibilityPublicLabel') },
    { key: true, label: _ts('components.addProject', 'visibilityPrivateLabel') },
];

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,

    setUserProject: PropTypes.func.isRequired,
    setUserProfileProject: PropTypes.func.isRequired,
    setUsergroupProject: PropTypes.func.isRequired,
    onProjectAdd: PropTypes.func,
    userId: PropTypes.number, // eslint-disable-line
    userGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
    })),
};

const defaultProps = {
    className: '',
    userGroups: [],
    onProjectAdd: undefined,
};

const mapDispatchToProps = dispatch => ({
    setUserProject: params => dispatch(setProjectAction(params)),
    setUserProfileProject: params => dispatch(setUserProjectAction(params)),
    setUsergroupProject: params => dispatch(setUsergroupViewProjectAction(params)),
});

const projectAddSchema = {
    fields: {
        title: [requiredCondition],
        isPrivate: [],
        organizations: [],
    },
};

const shouldHidePrivacyChangeButton = ({ accessPrivateProject }) => !accessPrivateProject;

function ProjectAddForm(props) {
    const {
        className,
        onModalClose,
        userGroups,
        userId,
        onProjectAdd,
        setUserProject,
        setUsergroupProject,
        setUserProfileProject,
    } = props;

    const [faramValues, setFaramValues] = useState({ isPrivate: false, organizations: [] });
    const [submitValues, setSubmitValues] = useState({});
    const [faramErrors, setFaramErrors] = useState({});
    const [pristine, setPristine] = useState(true);

    const [
        pending,
        ,
        ,
        createNewProject,
    ] = useRequest({
        url: 'server://projects/',
        body: submitValues,
        method: 'POST',
        onSuccess: (response) => {
            // FIXME: Remove too many redux writes in future
            setUserProject({ project: response });
            setUsergroupProject({ project: response });
            setUserProfileProject({
                userId,
                project: response,
            });
            if (onProjectAdd) {
                onProjectAdd(response.id);
            }
            notify.send({
                title: _ts('components.addProject', 'userProjectCreate'),
                type: notify.type.SUCCESS,
                message: _ts('components.addProject', 'userProjectCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            onModalClose();
        },
        onFailure: (error, errorBody) => {
            setFaramErrors(errorBody?.faramErrors);
            notifyOnFailure(_ts('components.addProject', 'addProjectModalLabel'))({ error: errorBody });
        },
    });

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        setPristine(false);
    }, [setFaramValues, setFaramErrors, setPristine]);

    const handleFaramFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, [setFaramErrors]);

    const handleFaramSuccess = useCallback((values) => {
        setSubmitValues({
            ...values,
            userGroups,
        });
        createNewProject();
    }, [createNewProject, userGroups]);

    return (
        <Faram
            className={_cs(className, styles.userProjectAddForm)}
            onChange={handleFaramChange}
            onValidationFailure={handleFaramFailure}
            onValidationSuccess={handleFaramSuccess}
            schema={projectAddSchema}
            value={faramValues}
            error={faramErrors}
            disabled={pending}
        >
            { pending && <LoadingAnimation /> }
            <NonFieldErrors faramElement />
            <TextInput
                faramElementName="title"
                label={_ts('components.addProject', 'addProjectModalLabel')}
                placeholder={_ts('components.addProject', 'addProjectModalPlaceholder')}
                autoFocus
            />
            <Cloak
                hide={shouldHidePrivacyChangeButton}
                render={
                    <SegmentInput
                        options={projectVisibilityOptions}
                        className={styles.isPrivateCheckbox}
                        faramElementName="isPrivate"
                        label={_ts('components.addProject', 'projectVisibilityInputLabel')}
                        hint={_ts('components.addProject', 'projectVisibilityInputHint')}
                    />
                }
            />
            <div className={styles.actionButtons}>
                <DangerButton onClick={onModalClose}>
                    {_ts('components.addProject', 'modalCancel')}
                </DangerButton>
                <PrimaryButton
                    type="submit"
                    disabled={pending || pristine}
                >
                    {_ts('components.addProject', 'modalCreate')}
                </PrimaryButton>
            </div>
        </Faram>
    );
}

ProjectAddForm.propTypes = propTypes;
ProjectAddForm.defaultProps = defaultProps;

export default connect(undefined, mapDispatchToProps)(ProjectAddForm);
