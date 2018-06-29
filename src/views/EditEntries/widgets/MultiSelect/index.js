import React from 'react';
import PropTypes from 'prop-types';

import SelectInputWithList from '#rs/components/Input/SelectInputWithList';
// import _ts from '#ts';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getOptions = (widget = {}) => {
    const { properties: { data: { options = emptyArray } = {} } = {} } = widget;
    return options;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class MultiSelectWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static valueKeyExtractor = d => d.key;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <div>
                <SelectInputWithList
                    faramElementName="value"
                    showLabel={false}
                    hideClearButton
                    options={options}
                />
            </div>
        );
    }
}
