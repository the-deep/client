import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import InternalGallery from '#components/viewer/InternalGallery';
import Cloak from '#components/general/Cloak';
import TabularBook from '#components/other/TabularBook';
import MultiViewContainer from '#rscv/MultiViewContainer';
import AccentButton from '#rsca/Button/AccentButton';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

const TAB_TABULAR = 'tabular';
const TAB_ORIGINAL = 'original';

function getFileType(title = '') {
    return title.toLowerCase().match(/(?:\.([^.]+))?$/)[1];
}

// FIXME: use is LeadPaneType spreadsheet
const tabularCompatibleFileTypes = [
    'xls',
    'xlsx',
    // 'xlsx2',
    'csv',
    'ods',
];

const propTypes = {
    attachment: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    tabularBook: PropTypes.number,
    projectId: PropTypes.number,
    className: PropTypes.string,
    onTabularButtonClick: PropTypes.func.isRequired,
    viewOnly: PropTypes.bool,
};

const defaultProps = {
    tabularBook: undefined,
    projectId: undefined,
    className: '',
    viewOnly: false,
};

export default class Attachment extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            tabularBook: tBook,
        } = props;

        this.tabTitles = {
            [TAB_ORIGINAL]: _ts('viewer.attachment', 'originalTabTitle'),
        };

        if (tBook) {
            this.tabTitles[TAB_TABULAR] = _ts('viewer.attachment', 'tabularTabTitle');
        }

        this.state = {
            activeTab: TAB_ORIGINAL,
        };

        this.views = {
            [TAB_TABULAR]: {
                component: () => {
                    const {
                        tabularBook,
                        projectId,
                    } = this.props;

                    if (!tabularBook) {
                        return null;
                    }
                    return (
                        <TabularBook
                            bookId={tabularBook}
                            projectId={projectId}
                            isModal={false}
                            viewMode
                        />
                    );
                },
            },
            [TAB_ORIGINAL]: {
                component: () => {
                    const { attachment } = this.props;

                    return (
                        <InternalGallery
                            attachmetn={attachment}
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
        const { onTabularButtonClick, attachment } = this.props;
        if (onTabularButtonClick) {
            const fileType = getFileType(attachment.title);
            onTabularButtonClick({
                ...attachment,
                fileType,
            });
        }
    }

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    };

    isExtractable = () => {
        const { viewOnly, attachment } = this.props;
        const fileType = getFileType(attachment.title);
        return !viewOnly && this.isTabularCompatible(fileType);
    }

    shouldHideTabularButton = () => {
        const { tabularBook } = this.props;
        const isAlreadyExtracted = !!tabularBook;
        return !isAlreadyExtracted && !this.isExtractable();
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
                            tabs={this.tabTitles}
                            active={activeTab}
                            onClick={this.handleTabClick}
                        >
                            { !viewOnly &&
                                <AccentButton
                                    className={styles.tabularButton}
                                    onClick={this.handleTabularButtonClick}
                                >
                                    {isAlreadyExtracted ?
                                        _ts('addLeads', 'tabularButtonTitle') :
                                        _ts('addLeads', 'extractTabularButtonTitle')
                                    }
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
                        attachment={attachment}
                        notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                        showUrl
                    />
                }
            />
        );
    }
}
