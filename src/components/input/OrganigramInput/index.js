import PropTypes from 'prop-types';
import React from 'react';

import OrgChart from '#rscz/OrgChart';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import SelectInputWithList from '#rsci/SelectInputWithList';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import MultiSelectInput from '#rsci/MultiSelectInput';
import ModalFooter from '#rscv/Modal/Footer';
import { FaramInputElement } from '#rscg/FaramElements';
import Label from '#rsci/Label';

import _ts from '#ts';
import _cs from '#cs';

import { iconNames } from '#constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.string),
    idSelector: PropTypes.func,
    labelSelector: PropTypes.func,
    childSelector: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    hideList: PropTypes.bool,
    modalLeftComponent: PropTypes.node,
    emptyComponent: PropTypes.func,
};

const defaultProps = {
    label: '',
    showLabel: true,
    className: '',
    title: _ts('components.organigram', 'defaultTitle'),
    onChange: undefined,
    hideList: false,
    value: [],
    disabled: false,
    readOnly: false,
    idSelector: organ => organ.id,
    labelSelector: organ => organ.title,
    childSelector: organ => organ.children,
    data: [],
    modalLeftComponent: undefined,
    emptyComponent: undefined,
};

const emptyObject = {};

const getOptionsForSelect = (params) => {
    const {
        data,
        idSelector,
        labelSelector,
        childSelector,
        prefix = '',
    } = params;

    if (!data || data.length === 0) {
        return [];
    }

    return data.reduce((options, d) => [
        {
            id: idSelector(d),
            name: `${prefix}${labelSelector(d)}`,
        },
        ...options,
        ...getOptionsForSelect({
            data: childSelector(d),
            idSelector,
            labelSelector,
            childSelector,
            prefix: `${prefix}${labelSelector(d)} / `,
        }),
    ], []);
};

const handleDataForOrganigram = (props) => {
    const {
        idSelector,
        labelSelector,
        childSelector,
        data,
    } = props;

    let options = [];

    if (data) {
        options = getOptionsForSelect({
            idSelector,
            labelSelector,
            childSelector,
            data,
        });
    }
    return ({ options, mountSelectInput: !!data });
};


@FaramInputElement
export default class OrganigramInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static selectIdSelector = item => item.id;
    static selectLabelSelector = item => item.name;

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            showOrgChartModal: false,
        };

        const optionsInfo = handleDataForOrganigram(props);
        this.mountSelectInput = optionsInfo.mountSelectInput;
        this.options = optionsInfo.options;
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            data: newData,
        } = nextProps;

        const {
            value: oldValue,
            data: oldData,
        } = this.props;

        if (newValue !== oldValue) {
            this.setState({ value: newValue });
        }
        if (newData !== oldData) {
            const optionsInfo = handleDataForOrganigram(nextProps);
            this.mountSelectInput = optionsInfo.mountSelectInput;
            this.options = optionsInfo.options;
        }
    }

    handleCancelClick = () => {
        const { value } = this.props;
        this.setState({ showOrgChartModal: false, value });
    }

    handleApplyClick = () => {
        const { value } = this.state;
        const { onChange } = this.props;

        this.setState({ showOrgChartModal: false }, () => {
            if (onChange) {
                onChange(value);
            }
        });
    }

    handleSelectChange = (newValues) => {
        if (this.props.onChange) {
            this.props.onChange(newValues);
        }
    }

    handleSelection = (value) => {
        this.setState({ value });
    }

    handleShowModal = () => {
        this.setState({ showOrgChartModal: true });
    }

    renderOrgChartModal = () => {
        const { showOrgChartModal, value } = this.state;
        const {
            title,
            data,
            idSelector,
            labelSelector,
            childSelector,
            modalLeftComponent,
        } = this.props;

        if (!showOrgChartModal) {
            return null;
        }

        // FIXME: Use strings
        return (
            <Modal className={styles.orgchartModal}>
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    {/*
                        All organigrams in widgets have singular head
                    */}
                    {modalLeftComponent &&
                        <div className={styles.left}>
                            {modalLeftComponent}
                        </div>
                    }
                    <OrgChart
                        className={styles.orgchart}
                        data={data[0] || emptyObject}
                        labelSelector={labelSelector}
                        idSelector={idSelector}
                        childSelector={childSelector}
                        onSelection={this.handleSelection}
                        value={value}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        {/* FIXME: use strings */}
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        {/* FIXME: use strings */}
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    renderShowModalButton = () => {
        const { disabled, readOnly } = this.props;

        return (
            <AccentButton
                className={styles.action}
                iconName={iconNames.chart}
                onClick={this.handleShowModal}
                transparent
                disabled={disabled || readOnly}
            />
        );
    }

    renderSelection = () => {
        /* TODO: Don't toggle between MultiSelectInput & SelectInputWithList
            Make a separate ListComponent and use that in SelectInputWithList
            Use that component to build custom SelectInputWithList to use in GeoInput
            and organigram input
        */
        const {
            value,
            hideList,
            disabled,
            readOnly,
        } = this.props;

        if (!this.mountSelectInput) {
            return null;
        }

        if (hideList) {
            return (
                <div className={styles.noListSelection} >
                    <MultiSelectInput
                        value={value}
                        onChange={this.handleSelectChange}
                        className={styles.selectInput}
                        options={this.options}
                        labelSelector={OrganigramInput.selectLabelSelector}
                        keySelector={OrganigramInput.selectIdSelector}
                        showHintAndError={false}
                        hideSelectAllButton
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.chart}
                        onClick={this.handleShowModal}
                        disabled={disabled || readOnly}
                        transparent
                    />
                </div>
            );
        }
        return (
            <SelectInputWithList
                value={value}
                onChange={this.handleSelectChange}
                className={styles.selectInput}
                options={this.options}
                labelSelector={OrganigramInput.selectLabelSelector}
                keySelector={OrganigramInput.selectIdSelector}
                showHintAndError={false}
                topRightChild={this.renderShowModalButton}
                hideSelectAllButton
                disabled={disabled}
                readOnly={readOnly}
                emptyComponent={this.props.emptyComponent}
            />
        );
    }

    render() {
        const {
            label,
            showLabel,
            className: classNameFromProps,
        } = this.props;

        const OrgChartModal = this.renderOrgChartModal;
        const Selection = this.renderSelection;

        const className = _cs(
            classNameFromProps,
            styles.organigramInput,
            'organigram-input',
        );

        return (
            <div className={className}>
                {showLabel &&
                    <Label
                        show={showLabel}
                        text={label}
                    />
                }
                <Selection />
                <OrgChartModal />
            </div>
        );
    }
}
