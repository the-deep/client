import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import TextInput from '#rsci/TextInput';
import SegmentInput from '#rsci/SegmentInput';

import VerticalTabs from '#rscv/VerticalTabs';

import { listToMap } from '#rsu/common';
import TabTitle from '#components/general/TabTitle';

import _cs from '#cs';
import _ts from '#ts';

import HeaderSettings from './HeaderSettings';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    sheetId: PropTypes.string.isRequired,
    details: PropTypes.shape({
        fields: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    }),
};

const defaultProps = {
    className: '',
    details: {},
};

const emptyObject = {};

export default class SheetSettings extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static hiddenOptionsKeySelector = d => d.key;
    static fieldKeySelector = d => d.id;

    static hiddenOptions = [
        {
            key: true,
            label: 'True',
        },
        {
            key: false,
            label: 'False',
        },
    ];

    constructor(props) {
        super(props);
        const {
            details: {
                fields,
            },
        } = props;

        this.state = {
            activeHeader: String((fields[0] || emptyObject).id),
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            sheetId,
            details: {
                fields,
            },
        } = nextProps;
        const { sheetId: oldSheetId } = this.props;

        if (sheetId !== oldSheetId) {
            this.setState({
                activeHeader: String((fields[0] || emptyObject).id),
            });
        }
    }

    getHeaderDetails = memoize((fields, activeHeader) => {
        const headerIndex = fields.findIndex(f => String(f.id) === activeHeader);
        const headerDetails = fields[headerIndex];
        return ({
            headerIndex,
            headerDetails,
        });
    });

    calcTabs = memoize((fields) => {
        const fieldsMap = listToMap(
            fields,
            d => d.id,
            d => d.title,
        );
        return fieldsMap;
    });

    handleHeaderChange = activeHeader => this.setState({ activeHeader });

    renderTab = (tabKey, _, index) => {
        const {
            details: {
                fields,
            },
        } = this.props;

        const tabs = this.calcTabs(fields);
        const title = tabs[tabKey];

        return (
            <TabTitle
                title={title}
                faramElementName={index}
            />
        );
    }

    render() {
        const {
            className,
            sheetId,
            details: {
                fields,
            },
        } = this.props;

        const { activeHeader } = this.state;

        const tabs = this.calcTabs(fields);

        const {
            headerIndex,
            headerDetails,
        } = this.getHeaderDetails(fields, activeHeader);

        const sheetTitleLabel = _ts('tabular.editModal', 'sheetTitleLabel');
        const sheetHideLabel = _ts('tabular.editModal', 'sheetHideLabel');
        const headersTitle = _ts('tabular.editModal', 'headersTitle');

        return (
            <FaramGroup faramElementName={sheetId}>
                <div className={_cs(styles.sheet, className)}>
                    <div className={styles.topContainer}>
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            label={sheetTitleLabel}
                        />
                        <SegmentInput
                            faramElementName="hidden"
                            options={SheetSettings.hiddenOptions}
                            label={sheetHideLabel}
                            keySelector={SheetSettings.hiddenOptionsKeySelector}
                        />
                    </div>
                    <div className={styles.headerSettingsContainer}>
                        <div className={styles.leftContainer}>
                            <h3 className={styles.headersTitle}>
                                {headersTitle}
                            </h3>
                            <FaramList
                                faramElementName="fields"
                                keySelector={SheetSettings.fieldKeySelector}
                            >
                                <VerticalTabs
                                    className={styles.headerTitles}
                                    tabs={tabs}
                                    active={activeHeader}
                                    modifier={this.renderTab}
                                    onClick={this.handleHeaderChange}
                                />
                            </FaramList>
                        </div>
                        <FaramList
                            faramElementName="fields"
                            keySelector={SheetSettings.fieldKeySelector}
                        >
                            {activeHeader &&
                                <HeaderSettings
                                    headerIndex={headerIndex}
                                    headerDetails={headerDetails || emptyObject}
                                />
                            }
                        </FaramList>
                    </div>
                </div>
            </FaramGroup>
        );
    }
}
