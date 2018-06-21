import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import ResizableH from '#rscv/Resizable/ResizableH';
import List from '#rscv/List';

import entryAccessor from '../entryAccessor';
import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';

import styles from './styles.scss';

const propTypes = {
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    onEntrySelect: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    entries: [],
    widgets: [],
    selectedEntryKey: undefined,
    pending: false,
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static viewMode = 'list'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Overview.viewMode, widget.widgetId),
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

        const selected = this.props.selectedEntryKey === key;

        return (
            <Button
                key={key}
                onClick={() => this.props.onEntrySelect(key)}
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
            widgets, // eslint-disable-line no-unused-vars
            selectedEntryKey, // eslint-disable-line no-unused-vars
            onEntrySelect, // eslint-disable-line no-unused-vars

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
                        viewMode={Overview.viewMode}
                        {...otherProps}
                    />
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
