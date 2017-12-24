/**
 * @author mrdoob / http://mrdoob.com/
 */
declare var Stats: () => {
    REVISION: number;
    domElement: HTMLDivElement;
    setMode: (value: any) => void;
    begin: () => void;
    end: () => number;
    update: () => void;
};
