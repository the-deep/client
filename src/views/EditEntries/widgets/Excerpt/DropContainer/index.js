import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    show: PropTypes.bool,
};

const defaultProps = {
    className: '',
    show: false,
};

export default class DropContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            show,
            className: classNameFromProps,
        } = this.props;

        if (!show) {
            return null;
        }

        // FIXME: use strings
        const contentText = 'Drop text or image here';
        const className = `
            ${classNameFromProps}
            ${styles.dropdownContainer}
            'dropdown-container'
        `;

        return (
            <div className={className}>
                { contentText }
            </div>
        );
    }
}
