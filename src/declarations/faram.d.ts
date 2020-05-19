declare module '@togglecorp/faram' {
    import * as React from 'react';

    export interface Schema {
        fields: {
            [key: string]: unknown[] | Schema;
        };
    }

    interface FaramProps {
        className?: string;
        schema: Schema;
        value: any;
        error: any;
        onChange: (faramValues: any, faramErrors: any) => void;
        onValidationSuccess?: (faramValues: any) => void;
        onValidationFailure?: (faramErrors: any) => void;
        disabled?: boolean;
    }

    export default class Faram extends React.PureComponent<FaramProps> {
    }

    export function FaramList(props: {
        faramElementName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        keySelector: (item: any) => string | number;
        children: React.ReactNode | null;
    });

    export function FaramGroup(props: {
        faramElementName: string;
        children: React.ReactNode | null;
    });


    interface ValidOp {
        ok: boolean;
        mesage?: string;
    }

    export const exclusiveInBetweenCondition: (min: number, max: number) => (value: any) => ValidOp;
    export const inclusiveInBetweenCondition: (min: number, max: number) => (value: any) => ValidOp;
    export const lessThanCondition: (n: number) => (value: any) => ValidOp;
    export const greaterThanCondition: (n: number) => (value: any) => ValidOp;
    export const lessThanOrEqualToCondition: (n: number) => (value: any) => ValidOp;
    export const greaterThanOrEqualToCondition: (n: number) => (value: any) => ValidOp;
    export const lengthLessThanCondition: (n: number) => (value: any) => ValidOp;
    export const lengthGreaterThanCondition: (n: number) => (value: any) => ValidOp;
    export const lengthEqualToCondition: (n: number) => (value: any) => ValidOp;
    export const requiredCondition: (value: any) => ValidOp;
    export const numberCondition: (value: any) => ValidOp;
    export const integerCondition: (value: any) => ValidOp;
    export const emailCondition: (value: any) => ValidOp;
    export const urlCondition: (value: any) => ValidOp;
    export const lenientUrlCondition: (value: any) => ValidOp;
    export const dateCondition: (value: any) => ValidOp;
    export const timeCondition: (value: any) => ValidOp;

    /*
    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramInputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'value' | 'onChange'> & { faramElementName: string; faramInfo?: any }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramOutputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'value'> & { faramElementName: string }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorMessageElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'errors'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorIndicatorElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'hasError' | 'errors'> & { faramElementName: string }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramActionElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'disabled' | 'changeDelay' | 'onClick'> & { faramElementName: string; faramAction: any }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'keySelector'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramSortableListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'onChange' | 'keySelector'> & { faramElement: boolean }>
    */
}
