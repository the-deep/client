import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import TextInput from '#rsci/TextInput';
import SegmentInput from '#rsci/SegmentInput';

import VerticalTabs from '#rscv/VerticalTabs';

import { listToMap } from '#rsu/common';

import HeaderSettings from '../HeaderSettings';
import styles from './styles.scss';

const hiddenOptions = [
    {
        key: true,
        label: 'True',
    },
    {
        key: false,
        label: 'False',
    },
];

const emptyObject = {};

export default class SheetSettings extends React.PureComponent {
    static propTypes = {};
    static defaultProps = {};

    static hiddenOptionsKeySelector = d => d.key;
    static fieldKeySelector = d => d.id;

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


    render() {
        const {
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

        return (
            <FaramGroup faramElementName={sheetId}>
                <TextInput
                    faramElementName="title"
                />
                <SegmentInput
                    faramElementName="hidden"
                    options={hiddenOptions}
                    label="Hide"
                    keySelector={SheetSettings.hiddenOptionsKeySelector}
                />
                <div className={styles.headerSettingsContainer}>
                    <VerticalTabs
                        tabs={tabs}
                        active={activeHeader}
                        onClick={this.handleHeaderChange}
                    />
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
            </FaramGroup>
        );
    }
}
