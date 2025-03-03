import { OneDArray, TColumn, TwoDArray } from './types';
import Base from './base';
import { Config, UserConfig } from './config';
import { ComponentChild } from 'preact';
declare class Header extends Base {
    private _columns;
    constructor();
    get columns(): OneDArray<TColumn>;
    set columns(columns: OneDArray<TColumn>);
    get visibleColumns(): OneDArray<TColumn>;
    /**
     * Tries to automatically adjust the width of columns based on:
     *    - Header cell content
     *    - Cell content of the first row
     *    - Cell content of the last row
     *
     * @param config
     */
    adjustWidth(config: Config): this;
    private setSort;
    private setFixedHeader;
    private setResizable;
    private setID;
    private populatePlugins;
    static fromColumns(columns: OneDArray<TColumn | string | ComponentChild>): Header;
    static fromUserConfig(userConfig: UserConfig): Header | null;
    static fromHTMLTable(element: HTMLElement): Header;
    /**
     * Converts the tree-like format of Header to a tabular format
     *
     * Example:
     *
     *    H1
     *      H1-H1
     *      H1-H2
     *    H2
     *      H2-H1
     *
     *    becomes:
     *      [
     *        [H1, H2],
     *        [H1-H1, H1-H2, H2-H1]
     *      ]
     *
     * @param columns
     */
    static tabularFormat(columns: OneDArray<TColumn>): TwoDArray<TColumn>;
    /**
     * Returns an array of leaf columns (last columns in the tree)
     *
     * @param columns
     */
    static leafColumns(columns: OneDArray<TColumn>): OneDArray<TColumn>;
    /**
     * Returns the maximum depth of a column tree
     * @param column
     */
    static maximumDepth(column: TColumn): number;
}
export default Header;
