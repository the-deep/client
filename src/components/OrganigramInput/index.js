import PropTypes from 'prop-types';
import React from 'react';

import OrgChart from '#rs/components/Visualization/OrgChart';
import Button from '#rs/components/Action/Button';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import Modal from '#rs/components/View/Modal';
import SelectInputWithList from '#rs/components/Input/SelectInputWithList';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import FaramElement from '#rs/components/Input/Faram/FaramElement';

import { iconNames } from '#constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.string),
    idSelector: PropTypes.func,
    labelSelector: PropTypes.func,
    childSelector: PropTypes.func,
    showHeader: PropTypes.bool,
};

const defaultProps = {
    className: '',
    title: 'Organigram', // FIXME: use strings
    onChange: undefined,
    value: [],
    showHeader: true,
    idSelector: organ => organ.id,
    labelSelector: organ => organ.title,
    childSelector: organ => organ.children,
};

const emptyObject = {};

const getOptionsForSelect = (params) => {
    const {
        data,
        idSelector,
        labelSelector,
        childSelector,
    } = params;

    let options = [];

    if (!data || data.length === 0) {
        return [];
    }

    data.forEach((d) => {
        options.push({
            id: idSelector(d),
            name: labelSelector(d),
        });
        options = [
            ...options,
            ...getOptionsForSelect({
                data: childSelector(d),
                idSelector,
                labelSelector,
                childSelector,
            }),
        ];
    });

    return options;
};

@FaramElement('input')
export default class OrganigramInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static selectIdSelector = item => item.id;
    static selectLabelSelector = item => item.name;

    constructor(props) {
        super(props);
        const {
            idSelector,
            labelSelector,
            childSelector,
            data,
        } = this.props;

        this.state = {
            value: props.value,
            showOrgChartModal: false,
        };

        this.options = getOptionsForSelect({
            idSelector,
            labelSelector,
            childSelector,
            data,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.organigramInput,
            'organigram-input',
        ];

        return classNames.join(' ');
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
        } = this.props;

        if (!showOrgChartModal) {
            return null;
        }

        // FIXME: Use strings
        return (
            <Modal className={styles.orgchartModal}>
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    <OrgChart
                        className={styles.orgchart}
                        data={data[0] || emptyObject}
                        labelAccessor={labelSelector}
                        idAccessor={idSelector}
                        childAccessor={childSelector}
                        onSelection={this.handleSelection}
                        value={value}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const {
            title,
            value,
            showHeader,
        } = this.props;

        const titleClassName = `${styles.title} title`;
        const headerClassName = `${styles.header} header`;
        const OrgChartModal = this.renderOrgChartModal;

        return (
            <div className={this.getClassName()}>
                {showHeader &&
                    <header className={headerClassName}>
                        <div className={titleClassName}>
                            { title }
                        </div>
                        <AccentButton
                            className={styles.action}
                            iconName={iconNames.chart}
                            onClick={this.handleShowModal}
                            transparent
                        />
                    </header>
                }
                <SelectInputWithList
                    value={value}
                    onChange={this.handleSelectChange}
                    className={styles.selectInput}
                    options={this.options}
                    labelSelector={OrganigramInput.selectLabelSelector}
                    keySelector={OrganigramInput.selectIdSelector}
                    showHintAndError={false}
                    topRightChild={!showHeader &&
                        <AccentButton
                            className={styles.action}
                            iconName={iconNames.chart}
                            onClick={this.handleShowModal}
                            transparent
                        />
                    }
                    hideSelectAllButton
                />
                <OrgChartModal />
            </div>
        );
    }
}
