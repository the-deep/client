import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';
import memoize from 'memoize-one';

import OrgChart from '#rscz/OrgChart';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SimpleListInput from '#rsci/SimpleListInput';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

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

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.string || PropTypes.number),
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
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
    persistentHintAndError: PropTypes.bool,
    icons: PropTypes.node,
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
    hint: '',
    error: '',
    showHintAndError: true,
    persistentHintAndError: true,
    icons: undefined,
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
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            // data: newData,
        } = nextProps;

        const {
            value: oldValue,
            // data: oldData,
        } = this.props;

        if (newValue !== oldValue) {
            this.setState({ value: newValue });
        }
    }

    getOptions = memoize((data, idSelector, labelSelector, childSelector) => {
        if (!data) {
            return undefined;
        }
        return getOptionsForSelect({
            idSelector,
            labelSelector,
            childSelector,
            data,
        });
    });


    handleCancelClick = () => {
        const { value } = this.props;

        this.setState({
            showOrgChartModal: false,
            value,
        });
    }

    handleApplyClick = () => {
        const { value } = this.state;
        const { onChange } = this.props;

        this.setState(
            { showOrgChartModal: false },
            () => {
                if (onChange) {
                    onChange(value);
                }
            },
        );
    }

    handleSelectChange = (newValues) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(newValues);
        }
    }

    handleSelection = (value) => {
        this.setState({ value });
    }

    handleShowModal = () => {
        this.setState({ showOrgChartModal: true });
    }

    render() {
        const {
            showOrgChartModal,
            value,
        } = this.state;

        const {
            childSelector,
            className: classNameFromProps,
            data,
            idSelector,
            labelSelector,
            modalLeftComponent,
            title,
            disabled,
            readOnly,
            hideList,

            error,
            hint,
            label,
            persistentHintAndError,
            showHintAndError,
            showLabel,
            emptyComponent,

            icons,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.organigramInput,
            'organigram-input',
        );

        return (
            <div className={className}>
                <div className={styles.inputContainer}>
                    <MultiSelectInput
                        className={styles.selectInput}
                        value={value}
                        onChange={this.handleSelectChange}
                        options={this.getOptions(data, idSelector, labelSelector, childSelector)}
                        labelSelector={OrganigramInput.selectLabelSelector}
                        keySelector={OrganigramInput.selectIdSelector}
                        hideSelectAllButton
                        disabled={disabled}
                        readOnly={readOnly}
                        error={error}
                        hint={hint}
                        label={label}
                        persistentHintAndError={persistentHintAndError}
                        showHintAndError={showHintAndError}
                        showLabel={showLabel}
                    />
                    <AccentButton
                        className={styles.action}
                        iconName="chart"
                        onClick={this.handleShowModal}
                        transparent
                        disabled={disabled || readOnly}
                        smallVerticalPadding
                        // FIXME: use strings
                        title="Open organigram"
                    />
                    {icons}
                </div>
                {data && !hideList && (
                    <SimpleListInput
                        className={styles.checklist}
                        listClassName={styles.list}
                        value={value}
                        onChange={this.handleSelectChange}
                        options={this.getOptions(data, idSelector, labelSelector, childSelector)}
                        labelSelector={OrganigramInput.selectLabelSelector}
                        keySelector={OrganigramInput.selectIdSelector}
                        disabled={disabled}
                        readOnly={readOnly}
                        showLabel={false}
                        showHintAndError={false}
                        emptyComponent={emptyComponent}
                    />
                )}
                {showOrgChartModal && (
                    <Modal className={styles.orgchartModal}>
                        <ModalHeader title={title} />
                        <ModalBody className={styles.body}>
                            {/* All organigrams in widgets have singular head */}
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
                )}
            </div>
        );
    }
}
