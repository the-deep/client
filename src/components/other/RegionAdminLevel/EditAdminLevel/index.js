import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, {
    greaterThanOrEqualToCondition,
    requiredCondition,
    integerCondition,
} from '@togglecorp/faram';

import { BgRestBuilder } from '#rsu/rest';
import { UploadBuilder } from '#rsu/upload';
import LoadingAnimation from '#rscv/LoadingAnimation';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import HiddenInput from '#rsci/HiddenInput';
import FileInput from '#rsci/FileInput';
import SelectInput from '#rsci/SelectInput';
import Icon from '#rscg/Icon';

import {
    alterResponseErrorToFaramError,
    createParamsForAdminLevelsForRegionPOST,
    createParamsForAdminLevelsForRegionPATCH,
    createParamsForFileUpload,
    createUrlForAdminLevel,
    urlForAdminLevels,
    urlForUpload,
} from '#rest';
import { addAdminLevelForRegionAction } from '#redux';
import schema from '#schema';
import _ts from '#ts';

import notify from '#notify';
import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number,
    adminLevelsOfRegion: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    adminLevelDetail: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        level: PropTypes.number,
        nameProp: PropTypes.string,
        codeProp: PropTypes.string,
        parentNameProp: PropTypes.string,
        parentCodeProp: PropTypes.string,
        region: PropTypes.number,
        parent: PropTypes.number,
        geoShapeFile: PropTypes.number,
        geoShapeFileDetails: PropTypes.object,
    }),
    onClose: PropTypes.func.isRequired,
    addAdminLevelForRegion: PropTypes.func.isRequired,
};

const defaultProps = {
    adminLevelDetail: {},
    countryId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addAdminLevelForRegion: params => dispatch(addAdminLevelForRegionAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class EditAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = row => row.id;
    static labelSelector = row => row.title;

    constructor(props) {
        super(props);

        const {
            geoShapeFileDetails,
            ...faramValues
        } = this.props.adminLevelDetail;

        this.state = {
            faramErrors: {},
            faramValues,
            pending: false,
            pristine: true,
            adminLevelsOfRegion: this.calculateOtherAdminLevels(props.adminLevelsOfRegion),
            geoShapeFileDetails,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                level: [requiredCondition, integerCondition, greaterThanOrEqualToCondition(0)],
                nameProp: [],
                codeProp: [],
                parentNameProp: [],
                parentCodeProp: [],
                parent: [],
                geoShapeFile: [],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({
                adminLevelsOfRegion: this.calculateOtherAdminLevels(nextProps.adminLevelsOfRegion),
            });
        }
    }

    componentWillUnmount() {
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    calculateOtherAdminLevels = adminLevels => adminLevels.filter(adminLevel => (
        adminLevel.id !== this.props.adminLevelDetail.id
    ))

    createAlForRegionUpdateRequest = (data, adminLevelId) => {
        const urlForAdminLevel = createUrlForAdminLevel(adminLevelId);
        const requestForAdminLevelsUpdateForRegion = new BgRestBuilder()
            .url(urlForAdminLevel)
            .params(() => createParamsForAdminLevelsForRegionPATCH(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPatchResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: _ts('components.editAdminLevel', 'adminLevelEdit'),
                        type: notify.type.SUCCESS,
                        message: _ts('components.editAdminLevel', 'adminLevelEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                this.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to save admin level.'] },
                });
            })
            .build();
        return requestForAdminLevelsUpdateForRegion;
    }

    createAlForRegionCreateRequest = (data) => {
        const requestForAdminLevelsCreateForRegion = new BgRestBuilder()
            .url(urlForAdminLevels)
            .params(() => createParamsForAdminLevelsForRegionPOST(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPostResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: _ts('components.editAdminLevel', 'adminLevelCreate'),
                        type: notify.type.SUCCESS,
                        message: _ts('components.editAdminLevel', 'adminLevelCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                // FIXME: no need to notify with farams
                notify.send({
                    title: _ts('components.editAdminLevel', 'adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: _ts('components.editAdminLevel', 'adminLevelCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                // FIXME: no need to notify with farams
                notify.send({
                    title: _ts('components.editAdminLevel', 'adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: _ts('components.editAdminLevel', 'adminLevelCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to create admin level.'] },
                });
            })
            .build();
        return requestForAdminLevelsCreateForRegion;
    }

    // FORM RELATED
    changeCallback = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    failureCallback = (faramErrors) => {
        this.setState({ faramErrors });
    };

    successCallback = (values) => {
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }

        const countryId = this.props.countryId || this.props.adminLevelDetail.region;
        const adminLevelId = this.props.adminLevelDetail.id;

        if (adminLevelId) {
            // UPDATE
            this.requestForAlForRegion = this.createAlForRegionUpdateRequest(
                {
                    ...values,
                    region: countryId,
                },
                adminLevelId,
            );
        } else {
            // CREATE
            this.requestForAlForRegion = this.createAlForRegionCreateRequest(
                { ...values, region: countryId },
            );
        }
        this.requestForAlForRegion.start();
    };

    handleGeoFileInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('components.editAdminLevel', 'fileSelection'),
                type: notify.type.WARNING,
                message: _ts('components.editAdminLevel', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(files[0])
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                this.setState({
                    faramValues: {
                        ...this.state.faramValues,
                        geoShapeFile: response.id,
                    },
                    geoShapeFileDetails: response,
                    pristine: false,
                });
            })
            .progress((progress) => {
                console.warn(progress);
            })
            .build();
        // TODO: notify on fatal and failure
        this.uploader.start();
    }

    render() {
        const { onClose } = this.props;
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
            adminLevelsOfRegion,
            geoShapeFileDetails,
        } = this.state;

        return (
            <div className={styles.formContainer}>
                <Faram
                    className={styles.editAdminLevelForm}
                    onChange={this.changeCallback}
                    onValidationFailure={this.failureCallback}
                    onValidationSuccess={this.successCallback}

                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    {
                        pending && <LoadingAnimation />
                    }
                    <NonFieldErrors faramElement />
                    <div className={styles.adminLevelDetails} >
                        <TextInput
                            faramElementName="level"
                            label={_ts('components.editAdminLevel', 'adminLevelLabel')}
                            placeholder={_ts('components.editAdminLevel', 'adminLevelPlaceholder')}
                            className={styles.textInput}
                            type="number"
                            min={0}
                            autoFocus
                        />
                        <TextInput
                            faramElementName="title"
                            label={_ts('components.editAdminLevel', 'adminLevelNameLabel')}
                            placeholder={_ts('components.editAdminLevel', 'adminLevelNamePlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="nameProp"
                            label={_ts('components.editAdminLevel', 'namePropertyLabel')}
                            placeholder={_ts('components.editAdminLevel', 'namePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="codeProp"
                            label={_ts('components.editAdminLevel', 'pcodePropertyLabel')}
                            placeholder={_ts('components.editAdminLevel', 'pcodePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="parentNameProp"
                            label={_ts('components.editAdminLevel', 'parentNamePropLabel')}
                            placeholder={_ts('components.editAdminLevel', 'parentNamePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="parentCodeProp"
                            label={_ts('components.editAdminLevel', 'parentCodePropLabel')}
                            placeholder={_ts('components.editAdminLevel', 'parentCodePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <SelectInput
                            keySelector={EditAdminLevel.keySelector}
                            labelSelector={EditAdminLevel.labelSelector}
                            options={adminLevelsOfRegion}
                            showHintAndError={false}
                            faramElementName="parent"
                            label={_ts('components.editAdminLevel', 'parentAdminLevelLabel')}
                            placeholder={_ts('components.editAdminLevel', 'parentAdminLevelPlaceholder')}
                            className={styles.selectInput}
                        />
                        {geoShapeFileDetails ? (
                            <div className={styles.currentUpload}>
                                <p>
                                    {_ts('components.editAdminLevel', 'geoFileLabel')}
                                </p>
                                <a
                                    href={geoShapeFileDetails.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {geoShapeFileDetails.title}
                                </a>
                            </div>
                        ) : (
                            <p className={styles.noFileUpload}>
                                {_ts('components.editAdminLevel', 'noFileUploadedLabel')}
                            </p>
                        )}
                    </div>
                    <div className={styles.actionButtons}>
                        <div className={styles.leftContainer}>
                            <FileInput
                                className={styles.geoFile}
                                onChange={this.handleGeoFileInputChange}
                                error={faramErrors.geoShapeFile}
                                accept=".zip, .json, .geojson"
                            >
                                <span className={styles.load}>
                                    <Icon name="uploadFa" />
                                    {_ts('components.editAdminLevel', 'loadGeoShapeFile')}
                                </span>
                            </FileInput>
                            <Icon
                                name="help"
                                title={_ts('components.editAdminLevel', 'geoshapeTooltip')}
                            />
                            <HiddenInput faramElementName="geoShapeFile" />
                        </div>
                        <div className={styles.rightContainer}>
                            <DangerButton onClick={onClose}>
                                {_ts('components.editAdminLevel', 'cancelButtonLabel')}
                            </DangerButton>
                            <PrimaryButton
                                type="submit"
                                disabled={pending || pristine}
                            >
                                {_ts('components.editAdminLevel', 'saveChangesButtonLabel')}
                            </PrimaryButton>
                        </div>
                    </div>
                </Faram>
            </div>
        );
    }
}
