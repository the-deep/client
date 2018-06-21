import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rsca/Button';
import ResizableH from '#rscv/Resizable/ResizableH';
import List from '#rscv/List';


import {
    leadIdFromRoute,
    editEntriesSelectedEntryKeySelector,
    editEntriesEntriesSelector,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,
    editEntriesSetSelectedEntryKeyAction,
} from '#redux';

import { entryAccessor } from '#entities/editEntriesBetter';
import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    setSelectedEntryKey: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    entries: [],
    widgets: [],
    selectedEntryKey: undefined,
    pending: false,
};


const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    entries: editEntriesEntriesSelector(state),
    widgets: editEntriesWidgetsSelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entry: editEntriesSelectedEntrySelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static type = 'overview'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Overview.type, widget.widgetId),
    );

    constructor(props) {
        super(props);
        this.widgets = Overview.filterWidgets(props.widgets);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Overview.filterWidgets(newWidgets);
        }
    }

    renderEntry = (k, entry) => {
        const key = entryAccessor.key(entry);
        const { entryType, excerpt, image } = entryAccessor.data(entry) || {};

        const {
            selectedEntryKey,
            setSelectedEntryKey,
            leadId,
        } = this.props;

        const selected = selectedEntryKey === key;

        return (
            <Button
                key={key}
                onClick={() => setSelectedEntryKey({ leadId, key })}
                disabled={selected}
                transparent
            >
                {
                    entryType === 'image' ? (
                        <img
                            className={styles.image}
                            src={image}
                            alt={excerpt}
                        />
                    ) : (
                        excerpt
                    )
                }
            </Button>
        );
    };

    render() {
        const {
            pending,
            entry,
            entries,
            leadId, // eslint-disable-line no-unused-vars
            widgets, // eslint-disable-line no-unused-vars
            selectedEntryKey, // eslint-disable-line no-unused-vars
            setSelectedEntryKey, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        return (
            <ResizableH
                className={styles.overview}
                leftChild={
                    <div className={styles.sidePane}>
                        <List
                            data={entries}
                            modifier={this.renderEntry}
                        />
                    </div>
                }
                rightChild={
                    <WidgetFaram
                        entry={entry}
                        widgets={this.widgets}
                        pending={pending}
                        type={Overview.type}
                        {...otherProps}
                    />
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
