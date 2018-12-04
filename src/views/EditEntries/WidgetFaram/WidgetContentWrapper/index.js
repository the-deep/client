import PropTypes from 'prop-types';
import React from 'react';

import {
    addClassName,
    removeClassName,
} from '#rsu/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    blockDrop: PropTypes.bool,
};
const defaultProps = {
    blockDrop: false,
};

export default class WidgetContentWrapper extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        // NOTE: the explaination by frozenhelium
        // is that this is required
        this.dragEnterCount = 0;
    }

    handleDrop = (e) => {
        const { blockDrop } = this.props;
        if (!blockDrop) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    }

    handleDragEnter = () => {
        const { blockDrop } = this.props;
        if (!blockDrop) {
            return;
        }

        this.dragEnterCount += 1;

        if (this.dragEnterCount === 1) {
            const { current: container } = this.containerRef;
            addClassName(container, styles.draggedOver);
        }
    }

    handleDragLeave = () => {
        const { blockDrop } = this.props;
        if (!blockDrop) {
            return;
        }

        this.dragEnterCount -= 1;

        if (this.dragEnterCount < 1) {
            const { current: container } = this.containerRef;
            removeClassName(container, styles.draggedOver);
        }
    }


    render() {
        const {
            className: classNameFromProps,
            blockDrop, // eslint-disable-line no-unused-vars
            children,
            ...otherProps
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.widgetContentWrapper}
        `;

        const iconClassName = `
            ${styles.icon}
            ${iconNames.minusOutline}
        `;

        return (
            <div
                className={className}
                onDrop={this.handleDrop}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                ref={this.containerRef}
                {...otherProps}
            >
                { children }
                { blockDrop &&
                    <div className={styles.overlay}>
                        <span className={iconClassName} />
                        <div className={styles.message}>
                            { _ts('editEntry', 'noDropMessage') }
                        </div>
                    </div>
                }
            </div>
        );
    }
}
