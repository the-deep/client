import React from 'react';
import PropTypes from 'prop-types';

import OrganigramInput from '#components/OrganigramInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const getData = (widget = {}) => {
    const { properties: { data = {} } = {} } = widget;

    // Data is returned as an array because there might be miltiple heads
    return [data];
};

export default class OrganigramWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static childSelector = d => d.organs;
    static labelSelector = d => d.title;
    static idSelector = d => d.key;
    static valueKeySelector = d => d.id;

    render() {
        const { widget } = this.props;
        const data = getData(widget);

        return (
            <OrganigramInput
                faramElementName="values"
                data={data}
                childSelector={OrganigramWidget.childSelector}
                labelSelector={OrganigramWidget.labelSelector}
                idSelector={OrganigramWidget.idSelector}
                valueKeySelector={OrganigramWidget.valueKeySelector}
                showHeader={false}
            />
        );
    }
}
