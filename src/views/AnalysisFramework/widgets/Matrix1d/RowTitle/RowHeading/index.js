import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '#rs/components/Input/Faram/FaramElement';

const propTypes = {
    className: PropTypes.string,
    hasError: PropTypes.bool,
    isSelected: PropTypes.bool,
    title: PropTypes.string,
    index: PropTypes.number.isRequired,
};
const defaultProps = {
    isSelected: false,
    hasError: false,
    title: undefined,
    className: '',
};

@FaramElement('errorIndicator')
export default class RowHeading extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            index,
            title,
            isSelected,
            hasError,
        } = this.props;
        return (
            <span className={className}>
                { isSelected ? '#' : ''}
                {title || `Row ${index + 1}`}
                { hasError ? '?' : ''}
            </span>
        );
    }
}
