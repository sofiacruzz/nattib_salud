import { Component, h, RefObject } from 'preact';
import { BaseComponent, BaseProps } from '../base';
interface ShadowTableProps extends BaseProps {
    tableRef?: RefObject<Component>;
}
/**
 * ShadowTable renders a hidden table and is used to calculate the column's width
 * when autoWidth option is enabled
 */
export declare class ShadowTable extends BaseComponent<ShadowTableProps> {
    private tableElement;
    private tableClassName;
    private tableStyle;
    constructor(props: any, context: any);
    widths(): {
        [columnId: string]: {
            minWidth: number;
            width: number;
        };
    };
    render(): h.JSX.Element;
}
export {};
