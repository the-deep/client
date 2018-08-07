import React from 'react';
import PropTypes from 'prop-types';

import OrganigramInput from '#components/OrganigramInput';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    widget: undefined,
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
};

const getData = (widget) => {
    const { properties: { data } = {} } = widget;
    return data;
};

const TEXT = 'excerpt';
const IMAGE = 'image';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
};

export default class OrganigramWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static childSelector = d => d.organs;
    static labelSelector = d => d.title;
    static idSelector = d => d.key;

    constructor(props) {
        super(props);
        const { widget } = props;
        const data = getData(widget);

        // Data is returned as an array because there might be multiple heads
        this.data = data === undefined ? undefined : [data];
    }

    componentWillReceiveProps(nextProps) {
        const oldData = getData(this.props.widget);
        const newData = getData(nextProps.widget);
        if (newData !== oldData) {
            // Data is returned as an array because there might be multiple heads
            this.data = newData === undefined ? undefined : [newData];
        }
    }

    render() {
        const {
            entryType,
            excerpt,
            image,
        } = this.props;

        let excerptValue;
        switch (entryType) {
            case TEXT:
                excerptValue = excerpt;
                break;
            case IMAGE:
                excerptValue = image;
                break;
            default:
                console.error('Unknown entry type', entryType);
        }
        const excerptHeaderTitle = _ts('framework.geoWidget', 'excerptHeaderTitle');

        return (
            <OrganigramInput
                faramElementName="value"
                data={this.data}
                childSelector={OrganigramWidget.childSelector}
                labelSelector={OrganigramWidget.labelSelector}
                idSelector={OrganigramWidget.idSelector}
                modalLeftComponent={
                    <div className={styles.excerptContainer}>
                        <h4 className={styles.title} >
                            {excerptHeaderTitle}
                        </h4>
                        <ExcerptOutput
                            className={styles.excerptBox}
                            type={entryTypes[entryType]}
                            value={excerptValue}
                        />
                    </div>
                }
            />
        );
    }
}
