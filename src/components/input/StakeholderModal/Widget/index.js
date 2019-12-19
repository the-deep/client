import React from 'react';
import PropTypes from 'prop-types';

import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Confirm from '#rscv/Modal/Confirm';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    containerClassName: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.array,
    renderer: PropTypes.func,
};

const defaultProps = {
    renderer: undefined,
    containerClassName: undefined,
    value: undefined,
};

class Widget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            isBeingDraggedOver: false,
            showConfirmation: false,
            droppedOrganizationId: undefined,
        };

        this.dragEnterCount = 0;
    }

    handleConfirmation = (confirm) => {
        const {
            onChange,
            value,
        } = this.props;

        const { droppedOrganizationId } = this.state;

        if (confirm) {
            onChange([
                ...value,
                droppedOrganizationId,
            ]);
        }
        this.setState({
            droppedOrganizationId: undefined,
            showConfirmation: false,
        });
    }

    handleDragEnter = () => {
        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: true });
        }

        this.dragEnterCount += 1;
    }

    handleDragLeave = () => {
        this.dragEnterCount -= 1;

        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: false });
        }
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();

        const data = e.dataTransfer.getData('text');

        const {
            value,
            onChange,
        } = this.props;

        try {
            const parsedData = JSON.parse(data);
            if (parsedData && parsedData.organizationId) {
                const { organizationId } = parsedData;

                if (!value) {
                    onChange([organizationId]);
                } else if (value.findIndex(v => v === organizationId) === -1) {
                    const intercept = false;

                    if (intercept) {
                        this.setState({
                            showConfirmation: true,
                            droppedOrganizationId: organizationId,
                        });
                    } else {
                        onChange([...value, organizationId]);
                    }
                }
            }
        } catch (ex) {
            console.warn('Only organizations supported');
        }

        this.dragEnterCount = 0;
        this.setState({ isBeingDraggedOver: false });
    }


    render() {
        const {
            containerClassName,
            renderer: Renderer,
            ...otherProps
        } = this.props;

        const {
            isBeingDraggedOver,
            showConfirmation,
        } = this.state;

        return (
            <div
                className={_cs(
                    styles.widget,
                    containerClassName,
                    isBeingDraggedOver && styles.draggedOver,
                )}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                <div className={styles.dropMessage}>
                    {_ts('assessment.metadata.stakeholder', 'dropHereMessage')}
                </div>
                <Renderer
                    {...otherProps}
                />
                <Confirm
                    show={showConfirmation}
                    onClose={this.handleConfirmation}
                >
                    <p>
                        {_ts('assessment.metadata.stakeholder', 'dropConfirmation')}
                    </p>
                </Confirm>
            </div>
        );
    }
}

export default FaramInputElement(Widget);
