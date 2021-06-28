import React from 'react';
import PropTypes from 'prop-types';

import OrganigramInput from '#components/input/OrganigramInput';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    imageRaw: PropTypes.string,
    imageDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFieldData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widget: undefined,
    entryType: undefined,
    excerpt: undefined,
    imageRaw: undefined,
    imageDetails: undefined,
    tabularFieldData: undefined,
};

const getData = (widget) => {
    const { properties: { data } = {} } = widget;
    return data;
};

const TEXT = 'excerpt';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
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
            tabularFieldData,
            imageRaw,
            imageDetails,
        } = this.props;

        let excerptValue;
        switch (entryType) {
            case TEXT:
                excerptValue = excerpt;
                break;
            case IMAGE:
                excerptValue = imageDetails?.file ?? imageRaw;
                break;
            case DATA_SERIES:
                excerptValue = tabularFieldData;
                break;
            default:
                console.error('Unknown entry type', entryType);
        }
        const excerptHeaderTitle = _ts('widgets.tagging.organigram', 'excerptHeaderTitle');

        return (
            <OrganigramInput
                className={styles.organigramInput}
                faramElementName="value"
                data={this.data}
                childSelector={OrganigramWidget.childSelector}
                labelSelector={OrganigramWidget.labelSelector}
                idSelector={OrganigramWidget.idSelector}
                showLabel={false}
                emptyComponent={null}
                modalLeftComponent={
                    <div className={styles.excerptContainer}>
                        <h3 className={styles.title} >
                            {excerptHeaderTitle}
                        </h3>
                        <ExcerptOutput
                            className={styles.excerpt}
                            type={entryTypes[entryType]}
                            value={excerptValue}
                        />
                    </div>
                }
            />
        );
    }
}
