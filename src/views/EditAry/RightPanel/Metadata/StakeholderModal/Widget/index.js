import React from 'react';

import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

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
        };

        this.dragEnterCount = 0;
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
                if (!value) {
                    onChange([value]);
                } else if (value.findIndex(v => v === parsedData.organizationId) === -1) {
                    onChange([...value, parsedData.organizationId]);
                }
            }
        } catch (ex) {
            console.warn('Only organizations supported');
        }

        this.setState({ isBeingDraggedOver: false });
    }


    render() {
        const {
            containerClassName,
            renderer: Renderer,
            ...otherProps
        } = this.props;

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
                    Drop organization
                </div>
                <Renderer
                    {...otherProps}
                />
            </div>
        );
    }
}

export default FaramInputElement(Widget);
