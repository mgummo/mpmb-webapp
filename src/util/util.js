
// https://lodash.com/docs/4.17.15#castArray
function castArray(value) {
    if (typeof (value) === "undefined") {
        return [];
    }


    return Array.isArray(value) ? value : [value];
}

HTMLElement.prototype.replaceWithHTML = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    this.replaceWith(t.content.firstElementChild);
}