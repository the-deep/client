import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import InternalGallery from '#components/viewer/InternalGallery';
import AccentButton from '#rsca/Button/AccentButton';
import Cloak from '#components/general/Cloak';
import TabularBook from '#components/other/TabularBook';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';
import { mimeType as MIME_TYPES } from '#entities/lead';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

const TAB_TABULAR = 'tabular';
const TAB_ORIGINAL = 'original';

const tabularCompatibleMimeTypes = [
    'xls',
    'xlsx',
    'xlsx2',
    'csv',
    'ods',
];

const tabTitles = {
    [TAB_TABULAR]: _ts('viewer.attachment', 'tabularTabTitle'),
    [TAB_ORIGINAL]: _ts('viewer.attachment', 'originalTabTitle'),
};

const propTypes = {
    attachment: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    tabularBook: PropTypes.number,
    projectId: PropTypes.number,
    className: PropTypes.string,
    onTabularButtonClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    viewOnly: PropTypes.bool,
};

const defaultProps = {
    tabularBook: undefined,
    projectId: undefined,
    className: '',
    title: '',
    viewOnly: false,
};

export default class Attachment extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            activeTab: TAB_TABULAR,
            attachmentMimeType: undefined,
        };

        this.views = {
            [TAB_TABULAR]: {
                component: () => {
                    const {
                        tabularBook,
                        projectId,
                        title,
                    } = this.props;

                    if (tabularBook) {
                        return (
                            <TabularBook
                                bookId={tabularBook}
                                projectId={projectId}
                                isModal={false}
                                viewMode
                            />
                        );
                    }
                    return (
                        <div className={styles.extractTabularView} >
                            <button
                                className={styles.extractButton}
                                onClick={this.handleTabularButtonClick}
                                type="button"
                            >
                                {_ts('addLeads', 'extractTabularButtonTitle', { title })}
                            </button>
                        </div>
                    );
                },
            },
            [TAB_ORIGINAL]: {
                component: () => {
                    const { attachment } = this.props;

                    return (
                        <InternalGallery
                            galleryId={attachment && attachment.id}
                            notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                            showUrl
                        />
                    );
                },
            },
        };
    }

    isTabularCompatible = memoize((mimeType) => {
        if (!mimeType) {
            return false;
        }

        return tabularCompatibleMimeTypes.some(m => MIME_TYPES[m] === mimeType);
    });

    handleTabularButtonClick = () => {
        const { onTabularButtonClick } = this.props;
        const { attachmentMimeType } = this.state;
        if (onTabularButtonClick) {
            onTabularButtonClick(attachmentMimeType);
        }
    }

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    };

    handleAttachmentMimeTypeGet = (mimeType) => {
        this.setState({
            attachmentMimeType: mimeType,
        });
    }

    isExtractable = () => {
        const { viewOnly } = this.props;
        const { attachmentMimeType } = this.state;
        return !viewOnly && this.isTabularCompatible(attachmentMimeType);
    }

    shouldHideTabularButton = ({ isEarlyAccess }) => {
        const { tabularBook } = this.props;
        const isAlreadyExtracted = !!tabularBook;
        return !(isEarlyAccess && (isAlreadyExtracted || this.isExtractable()));
    }

    render() {
        const {
            attachment,
            className,
            viewOnly,
            tabularBook,
        } = this.props;

        const { activeTab } = this.state;

        const isAlreadyExtracted = !!tabularBook;

        return (
            <Cloak
                hide={this.shouldHideTabularButton}
                render={
                    <div className={_cs(className, styles.tabsContainer)}>
                        <ScrollTabs
                            className={styles.tabs}
                            tabs={tabTitles}
                            active={activeTab}
                            onClick={this.handleTabClick}
                        >
                            { !viewOnly && isAlreadyExtracted &&
                                <AccentButton
                                    className={styles.tabularButton}
                                    onClick={this.handleTabularButtonClick}
                                >
                                    {_ts('addLeads', 'tabularButtonTitle')}
                                </AccentButton>
                            }
                        </ScrollTabs>
                        <MultiViewContainer
                            views={this.views}
                            active={activeTab}
                        />
                    </div>
                }
                renderOnHide={
                    <InternalGallery
                        className={className}
                        galleryId={attachment && attachment.id}
                        notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                        showUrl
                        onMimeTypeGet={this.handleAttachmentMimeTypeGet}
                    />
                }
            />
        );
    }
}
