import React from 'react';
import PropTypes from 'prop-types';

import ScaleInput from '#rs/components/Input/ScaleInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

export default class ScaleWidget extends React.PureComponent {
    static valueKeyExtractor = d => d.key;

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = option => option.key;
    static labelSelector = option => option.title;
    static colorSelector = option => option.color;

    isDefaultSelector = (option) => {
        const {
            widget: { properties: { data: { value } } },
        } = this.props;

        return option.key === value;
    };

    render() {
        const {
            widget: { properties: { data: { scaleUnits } } },
        } = this.props;

        return (
            <div>
                <ScaleInput
                    faramElementName="selectedScale"
                    faramInfo={{ action: 'editEntry', entryType: 'excerpt', excerpt: 'Lana Del Ray rocks.' }}
                    showLabel={false}
                    hideClearButton
                    options={scaleUnits}
                    keySelector={ScaleWidget.keySelector}
                    labelSelector={ScaleWidget.labelSelector}
                    colorSelector={ScaleWidget.colorSelector}
                    isDefaultSelector={this.isDefaultSelector}
                />
            </div>
        );
    }
}
