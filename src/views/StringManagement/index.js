import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareBoolean,
    compareStringAsNumber,
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../vendor/react-store/utils/common';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import Table from '../../vendor/react-store/components/View/Table';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../vendor/react-store/components/Action/Button/WarningButton';
import VerticalTabs from '../../vendor/react-store/components/View/VerticalTabs';
import Message from '../../vendor/react-store/components/View/Message';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';

import {
    setLanguageAction,
    availableLanguagesSelector,

    allStringsSelector,
    linkStringsSelector,
    linkKeysSelector,
    problemsWithStringsSelector,
    problemCountsWithStringsSelector,

    selectedLanguageNameSelector,
    stringMgmtSetSelectedLanguageAction,
} from '../../redux';
import { iconNames } from '../../constants';

import LanguageGet from './requests/LanguageGet';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemsWithStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemCountsWithStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkKeys: PropTypes.array.isRequired,

    selectedLanguageName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    availableLanguages: PropTypes.array.isRequired,

    setSelectedLanguage: PropTypes.func.isRequired,
    setLanguage: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
    linkStrings: linkStringsSelector(state),
    problemsWithStrings: problemsWithStringsSelector(state),
    problemCountsWithStrings: problemCountsWithStringsSelector(state),
    linkKeys: linkKeysSelector(state),
    availableLanguages: availableLanguagesSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedLanguage: params => dispatch(stringMgmtSetSelectedLanguageAction(params)),
    setLanguage: params => dispatch(setLanguageAction(params)),
});

const emptyArray = [];
const problemKeys = [
    'badLink',
    'undefinedLink',
    'unusedLinks',
    'unusedStrings',
];

@connect(mapStateToProps, mapDispatchToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;
    static keyExtractor2 = e => e.id;

    constructor(props) {
        super(props);

        this.state = {
            linkName: '$all',
            pendingLanguage: (
                props.selectedLanguageName !== undefined &&
                props.selectedLanguageName !== '$devLang'
            ),
        };

        this.stringsTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareStringAsNumber(a.id, b.id),
            },
            {
                key: 'string',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 3,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
            },
            {
                key: 'duplicates',
                label: 'Duplicates',
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareBoolean(!!a.duplicates, !!b.duplicates, -1) ||
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
                modifier: a => (a.duplicates ? a.duplicates : '-'),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: () => (
                    <Fragment>
                        <WarningButton
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                        <DangerButton
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                    </Fragment>
                ),
            },
        ];

        this.stringsTableDefaultSort = {
            key: 'string',
            order: 'asc',
        };

        this.linksTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.id, b.id),
            },
            {
                key: 'string',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
            },
            {
                key: 'stringId',
                label: 'String Id',
                order: 3,
                sortable: false,
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 4,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: () => (
                    <Fragment>
                        <WarningButton
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                        <DangerButton
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                    </Fragment>
                ),
            },
        ];

        this.linksTableDefaultSort = {
            key: 'id',
            order: 'asc',
        };
    }

    componentWillMount() {
        if (
            this.props.selectedLanguageName !== undefined &&
            this.props.selectedLanguageName !== '$devLang'
        ) {
            this.createLanguageRequest(this.props.selectedLanguageName);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedLanguageName !== nextProps.selectedLanguageName) {
            if (
                nextProps.selectedLanguageName !== undefined &&
                nextProps.selectedLanguageName !== '$devLang'
            ) {
                this.createLanguageRequest(nextProps.selectedLanguageName);
            } else if (this.languageRequest) {
                this.setState({ pendingLanguage: false });
                this.languageRequest.stop();
            }
        }
    }

    componentWillUnmount() {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }
    }

    createLanguageRequest = (languageCode) => {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }

        const request = new LanguageGet({
            setState: params => this.setState(params),
            setLanguage: this.props.setLanguage,
        });
        this.languageRequest = request.create(languageCode);
        this.languageRequest.start();
    }

    handleTabLinkClick = name => this.setState({ linkName: name });

    renderLeftPane = () => {
        const { linkName } = this.state;
        const { linkKeys } = this.props;

        return (
            <div className={styles.leftPane}>
                <header className={styles.header}>
                    <h2>
                        Strings
                    </h2>
                </header>
                <VerticalTabs
                    className={styles.links}
                    tabs={linkKeys}
                    active={linkName}
                    onClick={this.handleTabLinkClick}
                    modifier={this.renderTabLink}
                />
            </div>
        );
    }

    renderTabLink = (key, data) => {
        const {
            warningCount,
            errorCount,
        } = this.props.problemCountsWithStrings[key] || {};

        return (
            <div
                key={key}
                className={styles.item}
            >
                <pre className={styles.title}>
                    {data}
                </pre>
                { warningCount > 0 &&
                    <span className={`${styles.badge} ${styles.warning}`}>
                        {warningCount}
                    </span>
                }
                { errorCount > 0 &&
                    <span className={`${styles.badge} ${styles.error}`}>
                        {errorCount}
                    </span>
                }
            </div>
        );
    }

    renderStringsTable = () => {
        const { linkName } = this.state;

        if (linkName !== '$all') {
            return null;
        }

        const { allStrings } = this.props;

        return (
            <Table
                className={styles.stringsTable}
                data={allStrings}
                headers={this.stringsTableHeader}
                keyExtractor={StringManagement.keyExtractor}
                defaultSort={this.stringsTableDefaultSort}
            />
        );
    }

    renderLinksTable = () => {
        const { linkName } = this.state;

        if (linkName === '$all') {
            return null;
        }

        const { linkStrings } = this.props;
        const data = linkStrings[linkName] || emptyArray;

        return (
            <Table
                className={styles.linksTable}
                data={data}
                headers={this.linksTableHeader}
                keyExtractor={StringManagement.keyExtractor2}
                defaultSort={this.linksTableDefaultSort}
            />
        );
    }

    renderProblem = (k, data) => {
        const { linkName } = this.state;
        const { problemsWithStrings } = this.props;
        const problems = problemsWithStrings[linkName] || [];
        const currentProblem = problems[data];

        if (!currentProblem || currentProblem.instances.length === 0) {
            return null;
        }

        const className = `
            ${styles.problem}
            ${styles[currentProblem.type]}
        `;

        return (
            <div
                className={className}
                key={data}
            >
                <h4 className={styles.title}>
                    {currentProblem.title}
                </h4>
                <ListView
                    className={styles.instances}
                    data={currentProblem.instances}
                    keyExtractor={d => d}
                    modifier={(key, d) => (
                        <div key={key}>
                            {d}
                            { currentProblem.title === 'Unused string' &&
                                <DangerButton
                                    transparent
                                    smallVerticalPadding
                                    iconName={iconNames.delete}
                                    disabled
                                />
                            }
                            { currentProblem.title === 'Unused link' &&
                                <DangerButton
                                    transparent
                                    smallVerticalPadding
                                    iconName={iconNames.delete}
                                    disabled
                                />
                            }
                            { currentProblem.title === 'Undefined link' &&
                                <SuccessButton
                                    transparent
                                    smallVerticalPadding
                                    iconName={iconNames.add}
                                    disabled
                                />
                            }
                            { currentProblem.title === 'Bad link' &&
                                <WarningButton
                                    transparent
                                    smallVerticalPadding
                                    iconName={iconNames.edit}
                                    disabled
                                />
                            }
                        </div>
                    )}
                />
            </div>
        );
    }

    renderProblems = () => {
        const { linkName } = this.state;
        const { problemCountsWithStrings } = this.props;
        const { errorCount = 0, warningCount = 0 } = problemCountsWithStrings[linkName] || {};

        if (errorCount + warningCount <= 0) {
            return (
                <Message className={styles.noProblems}>
                    Everything looks good
                </Message>
            );
        }

        return (
            <ListView
                className={styles.problems}
                data={problemKeys}
                modifier={this.renderProblem}
            />
        );
    }

    renderRightPane = () => {
        const StringsTable = this.renderStringsTable;
        const LinksTable = this.renderLinksTable;
        const Problems = this.renderProblems;

        const keySelector = d => d.code;
        const labelSelector = d => d.title;

        const {
            setSelectedLanguage,
            availableLanguages,
            selectedLanguageName,
        } = this.props;
        const { pendingLanguage } = this.state;

        return (
            <div className={styles.rightPane}>
                { pendingLanguage && <LoadingAnimation /> }
                <header className={styles.header}>
                    <div className={styles.inputs}>
                        <SelectInput
                            className={styles.input}
                            hideClearButton
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            onChange={setSelectedLanguage}
                            options={availableLanguages}
                            value={selectedLanguageName}
                            label="Selected Language"
                            placeholder="Default"
                            showHintAndError={false}
                        />
                    </div>
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            disabled
                        >
                            Add new string
                        </PrimaryButton>
                        <DangerButton
                            disabled
                        >
                            Discard
                        </DangerButton>
                        <SuccessButton
                            disabled
                        >
                            Save
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.content}>
                    <div className={styles.scrollWrapper}>
                        <LinksTable />
                        <StringsTable />
                    </div>
                    <Problems />
                </div>
            </div>
        );
    }

    render() {
        const LeftPane = this.renderLeftPane;
        const RightPane = this.renderRightPane;

        return (
            <div className={styles.stringPanel}>
                <LeftPane />
                <RightPane />
            </div>
        );
    }
}
