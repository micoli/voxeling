/**
 * Check if localStorage is supported                       const isSupported: boolean
 * Check if localStorage has an Item                        function hasItem(key: string): boolean
 * Get the amount of space left in localStorage             function getRemainingSpace(): number
 * Get the maximum amount of space in localStorage          function getMaximumSpace(): number
 * Get the used space in localStorage                       function getUsedSpace(): number
 * Get the used space of an item in localStorage            function getItemUsedSpace(): number
 * Backup Assosiative Array                                 interface Backup
 * Get a Backup of localStorage                             function getBackup(): Backup
 * Apply a Backup to localStorage                           function applyBackup(backup: Backup, fClear: boolean = true, fOverwriteExisting: boolean = true)
 * Dump all information of localStorage in the console      function consoleInfo(fShowMaximumSize: boolean = false)
 */
export declare module LocalStorage {
    /**
     * Flag set true if the Browser supports localStorage, widthout affecting it
     */
    const isSupported: boolean;
    /**
     * Check if localStorage has an Item / exists with the give key
     * @param key the key of the Item
     */
    function hasItem(key: string): boolean;
    /**
     * This will return the left space in localStorage without affecting it's content
     * Might be slow !!!
     */
    function getRemainingSpace(): number;
    /**
     * This function returns the maximum size of localStorage without affecting it's content
     * Might be slow !!!
     */
    function getMaximumSpace(): number;
    /**
     * This will return the currently used size of localStorage
     */
    function getUsedSpace(): number;
    /**
     * This will return the currently used size of a given Item, returns NaN if key is not found
     * @param key
     */
    function getItemUsedSpace(key: string): number;
    /**
     * Associative-array for localStorage holding key->value
     */
    interface Backup {
        [index: string]: string;
    }
    /**
     * This will return a localStorage-backup (Associative-Array key->value)
     */
    function getBackup(): Backup;
    /**
     * This will apply a localStorage-Backup (Associative-Array key->value)
     * @param backup            associative-array
     * @param fClear             optional flag to clear all existing storage first. Default: true
     * @param fOverwriteExisting optional flag to replace existing keys. Default: true
     */
    function applyBackup(backup: Backup, fClear?: boolean, fOverwriteExisting?: boolean): void;
    /**
     * This functions dumps all keys and values of the local Storage to the console,
     * as well as the current size and number of items
     * @param fShowMaximumSize optional, flag show maximum size of localStorage. Default: false
     */
    function consoleInfo(fShowMaximumSize?: boolean): void;
    function setItem(key: string, item: any): void;
    function removeItem(item: string): void;
    function getItem(item: string): string;
}
