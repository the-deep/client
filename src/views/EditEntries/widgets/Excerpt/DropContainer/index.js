import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    show: PropTypes.bool,
    contentText: PropTypes.string,
};

const defaultProps = {
    className: '',
    show: false,
    // FIXME: use strings
    contentText: 'Drop text or image here',
};

export default class DropContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            show,
            className: classNameFromProps,
            contentText,
        } = this.props;

        if (!show) {
            return null;
        }

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
