import PropTypes from 'prop-types';
import React from 'react';

import {
    _cs,
} from '@togglecorp/fujs';

import { renderWidget } from '../../../widgetUtils';

import styles from './styles.scss';

const propTypes = {};
const defaultProps = {};

export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            isBeingDraggedOver: false,
        };
    }

    handleDrop = (data) => {
        console.warn(data);
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

        try {
            const parsedData = JSON.parse(data);
            console.warn(parsedData);
        } catch (ex) {
            console.warn('hmmmm');
        }

        this.setState({ isBeingDraggedOver: false });
    }


    render() {
        const {
            index,
            data,
            sources,
            className,
        } = this.props;

        const {
            isBeingDraggedOver,
        } = this.state;

        return (
            <div
                className={_cs(
                    styles.widget,
                    className,
                    isBeingDraggedOver && styles.draggedOver,
                )}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                { renderWidget(index, data, sources, false, true) }
            </div>
        );
    }
}
