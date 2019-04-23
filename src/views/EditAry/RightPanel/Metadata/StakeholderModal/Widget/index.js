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
    }

    handleDragEnter = () => {
        this.setState({ isBeingDraggedOver: true });
    }

    handleDragExit = () => {
        this.setState({ isBeingDraggedOver: false });
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
                console.warn(parsedData.organizationId);
                if (!value) {
                    onChange([value]);
                } else if (value.findIndex(v => v === parsedData.organizationId) === -1) {
                    onChange([...value, parsedData.organizationId]);
                }
            }
        } catch (ex) {
            console.warn('hmmmm');
        }

        this.setState({ isBeingDraggedOver: false });
    }


    render() {
        const {
            /*
            index,
            data,
            sources,
            */
            containerClassName,
            renderer: Renderer,
            ...otherProps
        } = this.props;

        const { isBeingDraggedOver } = this.state;

        console.warn(this.props);

        return (
            <div
                className={_cs(
                    styles.widget,
                    containerClassName,
                    isBeingDraggedOver && styles.draggedOver,
                )}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                <Renderer
                    {...otherProps}
                />
            </div>
        );
    }
}

export default FaramInputElement(Widget);
