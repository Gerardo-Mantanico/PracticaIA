declare module 'jspdf/dist/jspdf.es.min.js' {
    export class jsPDF {
        constructor(options?: any);
        addPage(format?: string, orientation?: string): void;
        addImage(imageData: string | HTMLImageElement | HTMLCanvasElement, format: string, x: number, y: number, width: number, height: number): void;
        text(text: string | string[], x: number, y: number, options?: any): void;
        line(x1: number, y1: number, x2: number, y2: number, style?: any): void;
        rect(x: number, y: number, width: number, height: number, style?: string): void;
        setFont(fontName: string, style?: string): void;
        setFontSize(size: number): void;
        setTextColor(r: number, g?: number, b?: number): void;
        setDrawColor(r: number, g?: number, b?: number): void;
        setFillColor(r: number, g?: number, b?: number): void;
        getPageWidth(): number;
        getPageHeight(): number;
        save(filename: string): void;
        output(type?: string, filename?: string): any;
        splitTextToSize(text: string, maxWidth: number): string[];
        internal: {
            pageSize: {
                getWidth(): number;
                getHeight(): number;
            };
        };
    }
}
