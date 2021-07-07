import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, { requiredCondition } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Avatar from '#newComponents/ui/Avatar';
import SelectInput from '#rsci/SelectInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ImageInput from '#rsci/FileInput/ImageInput';
import TextInput from '#rsci/TextInput';
import HiddenInput from '#rsci/HiddenInput';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { NormalChecklistInput } from '#rsci/ChecklistInput';
import Complement from '#rscg/Complement';

import {
    setUserProfileAction,
    availableLanguagesSelector,
} from '#redux';
import _ts from '#ts';
import notify from '#notify';

import UserPatchRequest from '../requests/UserPatchRequest';
import UserImageUploadRequest from '../requests/UserImageUploadRequest';

import styles from './styles.scss';

const ChecklistInput = Complement(NormalChecklistInput);

const propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    handleModalClose: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    availableLanguages: PropTypes.array.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
    availableLanguages: availableLanguagesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserProfileAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class UserEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static languageKeySelector = d => d.code;
    static languageLabelSelector = d => d.title;

    static emailOptOutsKeySelector = d => d.key;
    static emailOptOutsLabelSelector = d => d.info;

    static schema = {
        fields: {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
            emailOptOuts: [],
            displayPicture: [],
            language: [],
        },
    };

    constructor(props) {
        super(props);

        this.emailOptOutsOptions = [
            { key: 'news_and_updates', info: _ts('userProfile', 'newsAndUpdatesInfo') },
            { key: 'join_requests', info: _ts('userProfile', 'joinRequestsInfo') },
            { key: 'email_comment', info: _ts('userProfile', 'entryCommentsInfo') },
        ];

        this.state = {
            faramErrors: {},
            faramValues: props.userInformation,
            pending: false,
            pristine: false,
            showGalleryImage: true,
            displayPictureUrl: props.userInformation.displayPictureUrl,
        };

        this.userPatchRequest = new UserPatchRequest({
            setState: v => this.setState(v),
            setUserInformation: this.props.setUserInformation,
            handleModalClose: this.props.handleModalClose,
            previousUserData: this.props.userInformation,
        });
    }

    componentWillUnmount() {
        this.userPatchRequest.stop();
        if (this.userImageUploader) {
            this.userImageUploader.stop();
        }
    }

    startRequestForUserImageUpload = (file) => {
        if (this.userImageUploader) {
            this.userImageUploader.stop();
        }
        const userImageUploader = new UserImageUploadRequest({
            handleImageUploadSuccess: this.handleImageUploadSuccess,
            setState: v => this.setState(v),
        });
        this.userImageUploader = userImageUploader.create(file);
        this.userImageUploader.start();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { userId } = this.props;
        this.userPatchRequest.init(userId, values).start();
    };

    // BUTTONS
    handleFaramClose = () => {
        this.props.handleModalClose();
    }

    // Image Input Change
    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('userProfile', 'fileSelection'),
                type: notify.type.WARNING,
                message: _ts('userProfile', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const file = files[0];
        this.startRequestForUserImageUpload(file);
    }

    handleImageUploadSuccess = (response) => {
        this.setState({
            faramValues: { ...this.state.faramValues, displayPicture: response.id },
            pristine: true,
            pending: false,
            displayPictureUrl: response.file,
        });
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            showGalleryImage,
            pending,
            displayPictureUrl,
        } = this.state;

        const { availableLanguages } = this.props;

        return (
            <Faram
                className={styles.userProfileEditForm}
                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onValidationFailure={this.handleFaramValidationFailure}
                schema={UserEdit.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <HiddenInput faramElementName="displayPicture" />
                {
                    showGalleryImage && (
                        <Avatar
                            className={styles.galleryImage}
                            src={displayPictureUrl}
                        />
                    )
                }
                <ImageInput
                    className={_cs(styles.galleryImageSelect, styles.displayPicture)}
                    showPreview={!showGalleryImage}
                    showStatus={false}
                    onChange={this.handleImageInputChange}
                    accept="image/png, image/jpeg, image/fig, image/gif"
                />
                <TextInput
                    label={_ts('userProfile', 'firstNameLabel')}
                    faramElementName="firstName"
                    placeholder={_ts('userProfile', 'firstNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    label={_ts('userProfile', 'lastNameLabel')}
                    faramElementName="lastName"
                    placeholder={_ts('userProfile', 'lastNamePlaceholder')}
                />
                <TextInput
                    label={_ts('userProfile', 'organizationLabel')}
                    faramElementName="organization"
                    placeholder={_ts('userProfile', 'organizationPlaceholder')}
                />
                <SelectInput
                    faramElementName="language"
                    keySelector={UserEdit.languageKeySelector}
                    labelSelector={UserEdit.languageLabelSelector}
                    options={availableLanguages}
                    label={_ts('userProfile', 'languageLabel')}
                    placeholder={_ts('userProfile', 'languagePlaceholder')}
                />
                <ChecklistInput
                    listClassName={styles.listSelection}
                    faramElementName="emailOptOuts"
                    keySelector={UserEdit.emailOptOutsKeySelector}
                    labelSelector={UserEdit.emailOptOutsLabelSelector}
                    options={this.emailOptOutsOptions}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleFaramClose}>
                        {_ts('userProfile', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('userProfile', 'modalSave')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
