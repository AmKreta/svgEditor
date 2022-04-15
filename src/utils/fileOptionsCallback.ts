import store, { State } from "../store/store";

export function exportAsJson() {
    const { page } = store.getState() as State;
    const { colors, gradients, images, pages } = page;
    const exportObj = { colors, gradients, images, pages };
    console.log(exportObj);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(exportObj, null, 4)], {
            type: "application/json"
        })
    );
    a.setAttribute("download", "data.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}