import store, { State } from "../store/store";

export function exportAsJson() {
    const { page } = store.getState() as State;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(page, null, 4)], {
            type: "application/json"
        })
    );
    a.setAttribute("download", `${page.name}-${page.activePageIndex}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function exportAsSvg() {
    const { page } = store.getState() as State;
    const svg = document.getElementById('svgEditor');
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([svg?.outerHTML || ''], {
            type: "image/svg+xml"
        })
    );
    a.setAttribute("download", `${page.name}-${page.activePageIndex}.svg`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}