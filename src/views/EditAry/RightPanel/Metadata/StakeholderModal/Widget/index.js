import React from 'react';

import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Confirm from '#rscv/Modal/Confirm';

import styles from './styles.scss';

const propTypes = {};
const defaultProps = {};

class Widget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            isBeingDraggedOver: false,
            showConfirmation: false,
            droppedOrganizationId: undefined,
            droppedOrganizationName: undefined,
        };

        this.dragEnterCount = 0;
    }

    handleConfirmation = (confirm) => {
        if (confirm) {
            this.props.onChange([
                ...this.props.value,
                this.state.droppedOrganizationId,
            ]);
        }
        this.setState({
            droppedOrganizationId: undefined,
            droppedOrganizationName: undefined,
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
                const {
                    organizationId,
                    isDonor,
                    organizationName,
                } = parsedData;
                if (!value) {
                    onChange([value]);
                } else if (value.findIndex(v => v === organizationId) === -1) {
                    const intercept = !isDonor && this.props.sourceType === 'donors';
                    if (intercept) {
                        this.setState({
                            showConfirmation: true,
                            droppedOrganizationId: organizationId,
                            droppedOrganizationName: organizationName,
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
            showConfirmation,
            droppedOrganizationName,
        } = this.state;

        const { isBeingDraggedOver } = this.state;

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
                    {/* FIXME: use strings */}
                    Drop here
                </div>
                <Renderer
                    {...otherProps}
                />
                <Confirm
                    show={showConfirmation}
                    onClose={this.handleConfirmation}
                >
                    <p>
                        {/* FIXME: use strings */}
                        <b>{droppedOrganizationName}</b> is not a donor organization.
                        Do you want to continue?
                    </p>
                </Confirm>
            </div>
        );
    }
}

export default FaramInputElement(Widget);
