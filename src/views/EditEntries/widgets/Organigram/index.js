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

export default class OrganigramWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static childSelector = d => d.organs;
    static labelSelector = d => d.title;
    static idSelector = d => d.key;

    constructor(props) {
        super(props);
        const { widget = {} } = props;
        const { properties: { data = {} } = {} } = widget;

        // Data is returned as an array because there might be multiple heads
        this.data = data === undefined ? undefined : [data];
    }

    componentWillReceiveProps(nextProps) {
        const { properties: { data: newData } = {} } = nextProps.widget;
        const { properties: { data: oldData } = {} } = this.props.widget;

        if (newData !== oldData) {
            // Data is returned as an array because there might be multiple heads
            this.data = newData === undefined ? undefined : [newData];
        }
    }

    render() {
        return (
            <OrganigramInput
                faramElementName="values"
                data={this.data}
                childSelector={OrganigramWidget.childSelector}
                labelSelector={OrganigramWidget.labelSelector}
                idSelector={OrganigramWidget.idSelector}
                showHeader={false}
            />
        );
    }
}
