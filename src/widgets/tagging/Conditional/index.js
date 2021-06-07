import React from 'react';
import PropTypes from 'prop-types';

import Conditional from '#widgetComponents/Conditional';

const propTypes = {
    widget: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
};


export default class ConditionalWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <Conditional
                faramElementName="value"
                {...this.props}
            />
        );
    }
}
