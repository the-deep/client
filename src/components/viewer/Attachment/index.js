import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import InternalGallery from '#components/viewer/InternalGallery';
import AccentButton from '#rsca/Button/AccentButton';
import Cloak from '#components/general/Cloak';
import TabularBook from '#components/other/TabularBook';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

const TAB_TABULAR = 'tabular';
const TAB_ORIGINAL = 'original';

const tabularCompatibleFileTypes = [
    'xls',
    'xlsx',
    // 'xlsx2',
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
            response: {},
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

    isTabularCompatible = memoize((fileType) => {
        if (!fileType) {
            return false;
        }

        return tabularCompatibleFileTypes.some(m => m === fileType);
    });

    handleTabularButtonClick = () => {
        const { onTabularButtonClick } = this.props;
        const { response } = this.state;
        if (onTabularButtonClick) {
            onTabularButtonClick(response);
        }
    }

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    };

    handleAttachmentMimeTypeGet = (response) => {
        const {
            title = '',
        } = response;
        const fileType = title.toLowerCase().match(/(?:\.([^.]+))?$/)[1];
        const newResponse = {
            ...response,
            fileType,
        };

        this.setState({
            response: newResponse,
        });
    }

    isExtractable = () => {
        const { viewOnly } = this.props;
        const { response } = this.state;
        return !viewOnly && this.isTabularCompatible(response.fileType);
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
