/**
* @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '#rs/components/Input/Faram/FaramElement';

const propTypes = {
    errors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    hasError: PropTypes.bool,
    renderer: PropTypes.func,
};

const defaultProps = {
    errors: {},
    hasError: false,
    renderer: () => null,
};

const getError = (obj) => {
    let error = [];
    const keys = Object.keys(obj);
    keys.forEach((key) => {
        const e = obj[key];
        if (e === undefined) {
            return;
        }

        if (key === '$internal') {
            error = [...error, ...e];
        } else if (typeof e === 'string' || typeof e === 'number') {
            error = [...error, e];
        } else {
            error = [...error, ...getError(e)];
        }
    });
    return error;
};

class ErrorWrapper extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            errors,
            hasError,
            renderer: Child,
        } = this.props;

        const error = hasError ? getError(errors).join('\n') : undefined;
        return (
            <Child
                hasError={hasError}
                error={error}
            />
        );
    }
}

export default FaramElement('errorIndicator')(ErrorWrapper);
