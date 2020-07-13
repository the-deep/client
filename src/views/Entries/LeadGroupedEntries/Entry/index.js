import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
    reverseRoute,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import { entriesSetEntryCommentsCountAction } from '#redux';
import ListView from '#rscv/List/ListView';
import modalize from '#rscg/Modalize';
import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import GridViewLayout from '#rscv/GridViewLayout';
import ButtonLikeLink from '#components/general/ButtonLikeLink';

import EntryCommentModal from '#components/general/EntryCommentModal';
import { pathNames } from '#constants';

import {
    fetchWidgetViewComponent,
    hasWidgetViewComponent,
    VIEW,
} from '#widgets';

import EntryLabelBadge from '#components/general/EntryLabel';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,
    projectId: PropTypes.number,
    leadId: PropTypes.number,
    setEntryCommentsCount: PropTypes.func.isRequired,
};

const defaultProps = {
    projectId: undefined,
    leadId: undefined,
    className: '',
};

const mapDispatchToProps = dispatch => ({
    setEntryCommentsCount: params => dispatch(entriesSetEntryCommentsCountAction(params)),
});

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

const entryLabelKeySelector = d => d.labelId;

@connect(null, mapDispatchToProps)
export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getWidgets = memoize(widgets => (
        widgets.filter(
            w => hasWidgetViewComponent(w.widgetId, w.properties.addedFrom),
        )
    ))

    handleCommentsCountChange = (unresolvedCommentCount, resolvedCommentCount, entryId) => {
        const {
            leadId,
            projectId,
            setEntryCommentsCount,
        } = this.props;

        const entry = {
            unresolvedCommentCount,
            resolvedCommentCount,
            entryId,
        };

        setEntryCommentsCount({ entry, projectId, leadId });
    }

    entryLabelsRendererParams = (key, data) => ({
        title: `${data.labelTitle} (${data.count})`,
        titleClassName: styles.title,
        className: styles.entryLabel,
        labelColor: data.labelColor,
        groups: data.groups,
    });

    renderWidgetHeader = (widget) => {
        const {
            title,
            widgetId,
        } = widget;

        const isExcerptWidget = widgetId === 'excerptWidget';

        return (
            <div
                className={_cs(
                    styles.header,
                    isExcerptWidget && styles.excerptWidgetHeader,
                )}
            >
                <h5
                    title={title}
                    className={_cs(
                        styles.heading,
                        isExcerptWidget && styles.excerptWidgetHeading,
                    )}
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
                createdBy,
                attributes,
                unresolvedCommentCount: commentCount,
                projectLabels,
            },
            projectId,
            leadId,
        } = this.props;

        const filteredWidgets = this.getWidgets(widgets);
        const entriesPageLink = reverseRoute(
            pathNames.editEntries,
            {
                projectId,
                leadId,
            },
        );

        return (
            <React.Fragment>
                <header className={_cs('entry-container-header', styles.entryHeader)}>
                    <div className={styles.rightContainer}>
                        <ListView
                            data={projectLabels}
                            className={styles.entryLabels}
                            rendererParams={this.entryLabelsRendererParams}
                            renderer={EntryLabelBadge}
                            keySelector={entryLabelKeySelector}
                            emptyComponent={null}
                        />
                        <ButtonLikeLink
                            className={styles.editEntryLink}
                            to={`${entriesPageLink}?entry_id=${entryId}`}
                        >
                            <Icon name="edit" />
                        </ButtonLikeLink>
                        <ModalButton
                            className={
                                _cs(
                                    styles.button,
                                    commentCount > 0 && styles.accented,
                                )
                            }
                            disabled={isFalsy(entryId)}
                            modal={
                                <EntryCommentModal
                                    entryServerId={entryId}
                                    onCommentsCountChange={this.handleCommentsCountChange}
                                    defaultAssignee={createdBy}
                                />
                            }
                            iconName="chat"
                        >
                            {commentCount > 0 &&
                                <div className={styles.commentCount}>
                                    {commentCount}
                                </div>
                            }
                        </ModalButton>
                    </div>
                </header>
                <Faram
                    className={_cs(classNameFromProps, styles.entry)}
                    value={attributes}
                    schema={emptySchema}
                >
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
            </React.Fragment>
        );
    }
}
