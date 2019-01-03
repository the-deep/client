import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '#rsu/rest';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import Table from '#rscv/Table';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    createUrlForAdminLevelsForRegion,
    createParamsForGet,
    createParamsForAdminLevelDelete,
    createUrlForAdminLevel,
} from '#rest';
import {
    adminLevelForRegionSelector,
    setAdminLevelsForRegionAction,
    unsetAdminLevelForRegionAction,
} from '#redux';
import schema from '#schema';
import { iconNames } from '#constants';
import _ts from '#ts';

import notify from '#notify';
import EditAdminLevel from './EditAdminLevel';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    countryId: PropTypes.number.isRequired,
    adminLevelList: PropTypes.arrayOf(
        PropTypes.shape({
            adminLevelId: PropTypes.number,
            level: PropTypes.number,
            name: PropTypes.string,
            nameProperty: PropTypes.string,
            parentNameProperty: PropTypes.string,
            parentPcodeProperty: PropTypes.string,
            podeProperty: PropTypes.string,
        }),
    ),

    setAdminLevelsForRegion: PropTypes.func.isRequired,
    unsetAdminLevelForRegion: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    adminLevelList: [],
    readOnly: false,
};

const mapStateToProps = (state, props) => ({
    adminLevelList: adminLevelForRegionSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAdminLevelsForRegion: params => dispatch(setAdminLevelsForRegionAction(params)),
    unsetAdminLevelForRegion: params => dispatch(unsetAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RegionAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.adminLevelHeaders = [
            {
                key: 'level',
                label: _ts('components.regionAdminLevel', 'levelLabel'),
                order: 1,
            },
            {
                key: 'title',
                label: _ts('components.regionAdminLevel', 'adminLevelNameText'),
                order: 2,
            },
            {
                key: 'nameProp',
                label: _ts('components.regionAdminLevel', 'namePropertyLabel'),
                order: 3,
            },
            {
                key: 'codeProp',
                label: _ts('components.regionAdminLevel', 'pcodePropertyLabel'),
                order: 4,
            },
            {
                key: 'parentNameProp',
                label: _ts('components.regionAdminLevel', 'parentNamePropLabel'),
                order: 5,
            },
            {
                key: 'parentCodeProp',
                label: _ts('components.regionAdminLevel', 'parentCodePropLabel'),
                order: 6,
            },
            {
                key: 'actions',
                label: _ts('components.regionAdminLevel', 'actionsLabel'),
                order: 7,
                modifier: row => (
                    <div className="action-btns">
                        <PrimaryButton
                            onClick={() => this.editAdminLevel(row)}
                            smallVerticalPadding
                            transparent
                            iconName={iconNames.edit}
                            disabled={this.props.readOnly}
                        />
                        <DangerConfirmButton
                            confirmationMessage={
                                _ts('components.regionAdminLevel', 'removeAdminLevelConfirm', { adminLevel: row.title })
                            }
                            onClick={() => this.handleDeleteAdminLevel(row)}
                            smallVerticalPadding
                            transparent
                            iconName={iconNames.delete}
                            disabled={this.props.readOnly}
                        />
                    </div>
                ),
            },
        ];

        this.state = {
            addAdminLevel: false,
            clickedAdminLevel: {},
            editAdminLevel: false,
            deletePending: false,
        };

        this.requestForAdminLevelsForRegion = this.createAlsForRegionRequest(props.countryId);
    }

    componentWillMount() {
        this.requestForAdminLevelsForRegion.start();
    }

    componentWillUnmount() {
        this.requestForAdminLevelsForRegion.stop();
    }

    createAlsForRegionRequest = (regionId) => {
        const urlForAdminLevelsForRegion = createUrlForAdminLevelsForRegion(regionId);
        const requestForAdminLevelsForRegion = new BgRestBuilder()
            .url(urlForAdminLevelsForRegion)
            .params(createParamsForGet)
            .preLoad(() => {})
            .postLoad(() => {})
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelsGetResponse');
                    this.props.setAdminLevelsForRegion({
                        adminLevels: response.results,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return requestForAdminLevelsForRegion;
    }

    createAlDeleteRequest = (adminLevelId, regionId) => {
        const urlForAdminLevel = createUrlForAdminLevel(adminLevelId);
        const requestForAdminLevelDelete = new BgRestBuilder()
            .url(urlForAdminLevel)
            .params(() => createParamsForAdminLevelDelete())
            .preLoad(() => { this.setState({ deletePending: true }); })
            .postLoad(() => { this.setState({ deletePending: false }); })
            .success(() => {
                // FIXME: write schema
                this.props.unsetAdminLevelForRegion({
                    adminLevelId,
                    regionId,
                });
                notify.send({
                    title: _ts('components.regionAdminLevel', 'adminLevelDelete'),
                    type: notify.type.SUCCESS,
                    message: _ts('components.regionAdminLevel', 'adminLevelDeleteSuccess'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .failure(() => {
                notify.send({
                    title: _ts('components.regionAdminLevel', 'adminLevelDelete'),
                    type: notify.type.ERROR,
                    message: _ts('components.regionAdminLevel', 'adminLevelDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('components.regionAdminLevel', 'adminLevelDelete'),
                    type: notify.type.ERROR,
                    message: _ts('components.regionAdminLevel', 'adminLevelDeleteFatal'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return requestForAdminLevelDelete;
    }

    addAdminLevel = () => {
        this.setState({ addAdminLevel: true });
    };

    editAdminLevel = (clickedAdminLevel) => {
        this.setState({
            editAdminLevel: true,
            clickedAdminLevel,
        });
    };

    handleModalClose = () => {
        this.setState({
            editAdminLevel: false,
            addAdminLevel: false,
        });
    };

    handleDeleteAdminLevel = (row) => {
        if (this.requestForAlDelete) {
            this.requestForAlDelete.stop();
        }
        this.requestForAlDelete = this.createAlDeleteRequest(
            row.id,
            this.props.countryId,
        );
        this.requestForAlDelete.start();
    }

    keySelector = rowData => rowData.id

    render() {
        const {
            className,
            adminLevelList,
            countryId,
            readOnly,
        } = this.props;
        const {
            deletePending,
            addAdminLevel,
            editAdminLevel,
        } = this.state;

        return (
            <div className={`${className} ${styles.adminLevels}`}>
                { deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h5>
                        {_ts('components.regionAdminLevel', 'adminLevelsHeader')}
                    </h5>
                    <PrimaryButton
                        iconName={iconNames.add}
                        disabled={deletePending || readOnly}
                        onClick={this.addAdminLevel}
                    >
                        {_ts('components.regionAdminLevel', 'addAdminLevelButtonLabel')}
                    </PrimaryButton>
                    { addAdminLevel &&
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                        >
                            <ModalHeader
                                title={_ts('components.regionAdminLevel', 'addAdminLevelButtonLabel')}
                                rightComponent={
                                    <PrimaryButton
                                        onClick={this.handleModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </PrimaryButton>
                                }
                            />
                            <ModalBody>
                                <EditAdminLevel
                                    countryId={countryId}
                                    onClose={this.handleModalClose}
                                    adminLevelsOfRegion={adminLevelList}
                                />
                            </ModalBody>
                        </Modal>
                    }
                </div>
                <div className={styles.adminLevelsList}>
                    <Table
                        data={adminLevelList}
                        headers={this.adminLevelHeaders}
                        keySelector={this.keySelector}
                    />
                    { editAdminLevel &&
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                        >
                            <ModalHeader
                                title={_ts('components.regionAdminLevel', 'editAdminLevelModalTitle')}
                                rightComponent={
                                    <PrimaryButton
                                        onClick={this.handleModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </PrimaryButton>
                                }
                            />
                            <ModalBody>
                                <EditAdminLevel
                                    adminLevelDetail={this.state.clickedAdminLevel}
                                    onClose={this.handleModalClose}
                                    adminLevelsOfRegion={adminLevelList}
                                />
                            </ModalBody>
                        </Modal>
                    }
                </div>
            </div>
        );
    }
}
