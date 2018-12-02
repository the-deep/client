import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import SearchInput from '#rsci/SearchInput';
import Checkbox from '#rsci/Checkbox';
import ColorInput from '#rsci/ColorInput';
import DateInput from '#rsci/DateInput';
import TimeInput from '#rsci/TimeInput';
import NumberInput from '#rsci/NumberInput';
import HiddenInput from '#rsci/HiddenInput';
import ListInput from '#rsci/ListInput';
import ListSelection from '#rsci/ListSelection';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SelectInput from '#rsci/SelectInput';
import SelectInputWithList from '#rsci/SelectInputWithList';
import RadioInput from '#rsci/RadioInput';
import ScaleInput from '#rsci/ScaleInput';
import MultiSegmentInput from '#rsci/MultiSegmentInput';
import SegmentInput from '#rsci/SegmentInput';
import TabularSelectInput from '#rsci/TabularSelectInput';

import { compareNumber } from '#rsu/common';

import Faram, {
    integerCondition,
    requiredCondition,
    lengthGreaterThanCondition,
    greaterThanCondition,
} from '#rscg/Faram';

import styles from './styles.scss';

/*
1. DropZone is not an input element
2. FileInput is not an input element
3. HierarchicalMultiSelectInput is most probably not used anywhere
4. Hierarchical SelectInput is most probably not used anywhere
5. TODO: Add tree selection here
7. Remove ListInput
 */

export default class Workshop extends React.PureComponent {
    static keySelector = elem => elem.key;
    static labelSelector = elem => elem.label;

    static schema = {
        fields: {
            search: [],
            username: [
                requiredCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
            ],
            age: [
                integerCondition,
                greaterThanCondition(0),
            ],
            rainbowAffinity: [],
            fruits: [],
            favoriteColor: [],
            dob: [],
            tob: [],
            hiddenValue: [],
            places: [],
            goodPlaces: [],
            goodPlace2: [],
            badPlaces: [],
            worstPlace: [],
            nicePlace: [],
            bestPlace: [],
            polutionIndex: [],
            gender: [],
            friends: [],
            description: [],
        },
        /*
        validation: ({ fromValue, toValue }) => {
            const errors = [];
            if (fromValue && toValue && fromValue > toValue) {
                errors.push('From value must be less than To value');
            }
            return errors;
        },
        */
    };

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {
                search: 'Looking',
                username: 'thenav56',
                password: 'noobnoob',
                rainbowAffinity: false,
                fruits: ['apple'],
                favoriteColor: '#ff0000',
                dob: '2012-10-1',
                tob: '10:10:00',
                hiddenValue: '3783947897982342',
                places: [
                    { key: 'pokhara', label: 'The Pokhara' },
                    { key: 'kathmandu', label: 'Dustmandu' },
                    { key: 'chitwan', label: 'Chitwan' },
                    { key: 'illam', label: 'Illam' },
                ],
                age: 16,
                badPlaces: [],
                worstPlace: undefined,
                worsePlaces: undefined,
                goodPlaces: [],
                bestPlace: undefined,
                pollutionIndex: undefined,
                gender: 'm',
                description: undefined,
                friends: [],
            },
            faramState: 'normal',
            // disabled: false,
            // readOnly: false,
            pending: false,
        };
    }

    componentWillUnmount() {
        clearTimeout(this.clearPendingTimeout);
    }

    handleFaramStateChange = (val) => {
        this.setState({ faramState: val });
    }

    handleFaramChange = (values, errors) => {
        this.setState({ faramValues: values, faramErrors: errors });
    }

    handleFaramValidationFailure = (errors) => {
        this.setState({ faramErrors: errors });
    }

    handleFaramValidationSuccess = (values) => {
        console.warn(values);
        this.setState({ pending: true });
        this.clearPendingTimeout = setTimeout(() => this.setState({ pending: false }), 4000);
    }

    render() {
        const {
            faramErrors,
            faramValues,
            faramState,
            // disabled,
            // readOnly,
            pending,
        } = this.state;

        const disabled = faramState === 'disabled';
        const readOnly = faramState === 'readOnly';

        return (
            <div className={styles.workshop}>
                <SegmentInput
                    name="random-name-for-segment-1"
                    labelSelector={Workshop.labelSelector}
                    keySelector={Workshop.keySelector}
                    value={this.state.faramState}
                    onChange={this.handleFaramStateChange}
                    options={[
                        { key: 'normal', label: 'Enabled' },
                        { key: 'disabled', label: 'Disabled' },
                        { key: 'readOnly', label: 'Readonly' },
                    ]}
                />

                <Faram
                    className={styles.faram}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Workshop.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={disabled || pending}
                    readOnly={readOnly}
                >
                    <NonFieldErrors faramElement />
                    <SearchInput
                        faramElementName="search"
                        label="Search"
                        placeholder="Anything"
                    />
                    <TextInput
                        faramElementName="username"
                        label="Username"
                        placeholder="Haris"
                        autoFocus
                    />
                    <TextInput
                        faramElementName="password"
                        label="Password"
                        placeholder="******"
                        type="password"
                    />
                    <Checkbox
                        faramElementName="rainbowAffinity"
                        label="I like rainbows"
                    />
                    <TextArea
                        faramElementName="description"
                        label="Description"
                        placeholder="Tell us about yourself"
                        autoFocus
                    />
                    <ColorInput
                        faramElementName="favoriteColor"
                        label="Favorite Color"
                    />
                    <DateInput
                        faramElementName="dob"
                        label="Date of Birth"
                        title="The date when you were born"
                        separator="-"
                    />
                    <TimeInput
                        faramElementName="tob"
                        label="Time of Birth"
                        title="The time when you were born"
                        separator=":"
                    />
                    <NumberInput
                        faramElementName="age"
                        label="Age"
                        title="Your age"
                        separator=" "
                    />
                    <HiddenInput
                        faramElementName="hiddenValue"
                    />
                    <ListInput
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="places"
                    />
                    <ListSelection
                        label="Good Places"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="goodPlaces"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <SelectInput
                        label="Worst place"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="worstPlace"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <SelectInputWithList
                        label="Worse place"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="worsePlaces"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <MultiSelectInput
                        label="Bad Places"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="badPlaces"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <RadioInput
                        faramElementName="bestPlace"
                        name="random-name-for-radio"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <ScaleInput
                        faramElementName="pollutionIndex"
                        colorSelector={elem => elem.color}
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        isDefault={elem => !!elem.default}
                        options={[
                            { key: 'pokhara', label: '0', color: 'green', default: true },
                            { key: 'chitwan', label: '1', color: 'orange' },
                            { key: 'kathmandu', label: '100', color: 'red' },
                        ]}
                    />
                    <SegmentInput
                        name="random-name-for-segment-2"
                        faramElementName="gender"
                        label="Gender"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        options={[
                            { key: 'm', label: 'Male' },
                            { key: 'f', label: 'Female' },
                        ]}
                    />
                    <MultiSegmentInput
                        label="Good Places"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        faramElementName="goodPlaces2"
                        options={[
                            { key: 'pokhara', label: 'The Pokhara' },
                            { key: 'kathmandu', label: 'Dustmandu' },
                            { key: 'chitwan', label: 'Chitwan' },
                            { key: 'illam', label: 'Illam' },
                        ]}
                    />
                    <TabularSelectInput
                        faramElementName="friends"
                        options={[
                            { key: 'a', label: 'ram', position: 1 },
                            { key: 'b', label: 'shyam', position: 4 },
                            { key: 'c', label: 'hari', position: 3 },
                            { key: 'd', label: 'gita', position: 2 },
                        ]}
                        label="Positions"
                        labelSelector={Workshop.labelSelector}
                        keySelector={Workshop.keySelector}
                        tableHeaders={[
                            {
                                key: 'label',
                                label: 'Label',
                                order: 1,
                                sortable: false,
                            },
                            {
                                key: 'position',
                                label: 'Position',
                                order: 2,
                                sortable: true,
                                comparator: (a, b) => compareNumber(a.position, b.position),
                            },
                        ]}
                    />

                    <PrimaryButton
                        type="submit"
                        pending={pending}
                    >
                        Submit
                    </PrimaryButton>
                </Faram>
            </div>
        );
    }
}
