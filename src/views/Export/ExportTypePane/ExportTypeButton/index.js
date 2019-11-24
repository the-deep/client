import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    buttonKey: PropTypes.string.isRequired,
    className: PropTypes.string,
    title: PropTypes.string,
    onExportTypeChange: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    img: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    title: '',
    img: undefined,
};

export default class ExportTypePaneButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleExportTypeClick = () => {
        const {
            buttonKey,
            onExportTypeChange,
        } = this.props;

        onExportTypeChange(buttonKey);
    }

    render() {
        const {
            className,
            title,
            img,
            isActive,
        } = this.props;

        return (
            <button
                className={_cs(
                    className,
                    styles.exportTypeSelect,
                    isActive && styles.active,
                )}
                title={title}
                onClick={this.handleExportTypeClick}
                type="button"
            >
                <img
                    className={styles.image}
                    src={img}
                    alt={title}
                />
            </button>
        );
    }
}
