import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import GridViewLayout from '#rscv/GridViewLayout';

import EntryCommentModal from '#components/general/EntryCommentModal';

import {
    fetchWidgetViewComponent,
    hasWidgetViewComponent,
    VIEW,
} from '#widgets';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,
};

const defaultProps = {
    className: '',
};

const widgetLayoutSelector = (widget) => {
    const {
        properties: {
            listGridLayout,
        } = {},
    } = widget;
    return listGridLayout;
};

const widgetKeySelector = widget => widget.key;

const emptySchema = { fields: {} };

export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getWidgets = memoize(widgets => (
        widgets.filter(
            w => hasWidgetViewComponent(w.widgetId, w.properties.addedFrom),
        )
    ))

    renderWidgetHeader = (widget) => {
        const { title } = widget;

        return (
            <div className={styles.header}>
                <h5
                    title={title}
                    className={styles.heading}
                >
                    { title }
                </h5>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetId,
            id,
            properties: { addedFrom },
        } = widget;

        const {
            entry: {
                entryType,
                excerpt,
                image,
                tabularField,
                tabularFieldData,
            },
        } = this.props;

        const Widget = fetchWidgetViewComponent(widgetId, addedFrom);

        let child;
        if (widgetId === 'excerptWidget') {
            child = (
                <Widget
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}

                    entryType={entryType}
                    excerpt={excerpt}
                    image={image}
                    tabularField={tabularField}
                    tabularFieldData={tabularFieldData}
                />
            );
        } else {
            child = (
                <Widget
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}
                />
            );
        }

        return (
            <FaramGroup faramElementName={String(id)}>
                <FaramGroup faramElementName="data">
                    <div className={styles.content} >
                        { child }
                    </div>
                </FaramGroup>
            </FaramGroup>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            widgets,
            entry: {
                id: entryId,
                attributes,
            },
        } = this.props;

        const filteredWidgets = this.getWidgets(widgets);

        return (
            <Faram
                className={_cs(classNameFromProps, styles.entry)}
                value={attributes}
                schema={emptySchema}
            >
                <header className={_cs('widget-container-header', styles.header)}>
                    <ModalButton
                        iconName="chat"
                        className={styles.button}
                        transparent
                        disabled={isFalsy(entryId)}
                        modal={
                            <EntryCommentModal
                                entryServerId={entryId}
                            />
                        }
                    />
                </header>
                <GridViewLayout
                    className={_cs(classNameFromProps, styles.entry)}
                    data={filteredWidgets}
                    itemClassName={styles.widget}
                    itemContentModifier={this.renderWidgetContent}
                    itemHeaderModifier={this.renderWidgetHeader}
                    keySelector={widgetKeySelector}
                    layoutSelector={widgetLayoutSelector}
                />
            </Faram>
        );
    }
}
