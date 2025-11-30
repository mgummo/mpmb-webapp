(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    const Mustache = global.Mustache;

    const templates = {
        "root": load_template("root"),
        "spell-card": load_template("spell-card"),
        "feature-card": load_template("feature-card"),
        "item-card": load_template("item-card"),
        "monster-card": load_template("monster-card"),
        "monster-card-action": load_template("monster-card-action"),
    };

    function load_template(name) {

        const template = document.getElementById(`${name}-template`);
        if (!template) {
            throw "Could not find template: " + name
        }

        return template.innerHTML
            .replaceAll('&gt;', '>');
    }

    function render(manifest, reflow_count) {
        const data = manifest;
        const spells = data.spells ?? [];
        const spells_that_overflow = data.spells_that_overflow ?? [];
        const monsters = data.monsters ?? [];

        if (reflow_count === undefined) {
            // Let's see if we have anything
            console.debug("Rendering the following spells: %o", spells)
            console.debug("Rendering the following monsters: %o", monsters)
            console.debug("Rendering the following feats: %o", data.feats)
        }

        const vm = {
            sections: {
                "character-sheet": {
                },
                "spell-cards": {
                    pages: paginate(spells, 3, 3),
                },
                "feature-cards": {
                    pages: paginate(data.feats, 3, 3),
                },
                "item-cards": {
                    pages: paginate(manifest.inventory, 3, 3),
                },
                "monster-cards": {
                    pages: paginate(monsters, 2, 2),
                },

            }
        };

        vm.sections["spell-cards"].pages = [
            ...vm.sections["spell-cards"].pages,
            ...paginate(spells_that_overflow, 2, 2)
        ];

        // todo: replace with vuejs
        const html = Mustache.render(templates.root, vm, templates);
        document.getElementById("app").innerHTML = html;

        if (!reflow_count) {
            // todo: optimize this
            // [Violation] 'setTimeout' handler took 55ms
            window.setTimeout(() => {
                reflow(data);
            });
        }
    }

    function paginate(cards, rows, columns) {
        const pages = []
        const cards_per_page = rows * columns;

        for (let i = 0; i < cards.length; i += cards_per_page) {
            const page = {
                cards: cards.slice(i, i + cards_per_page),
                grid_size: `${rows}x${columns}`,
            };
            pages.push(page);
        }
        return pages;
    }

    function reflow(data) {
        /** @type {HTMLElement[]} */
        const cards = findOverflowingCards();

        if (!cards.length) {
            return;
        }

        for (const card of cards) {
            const key = card.dataset.key
            const type = card.closest("section").dataset.card

            const model = global.mpmb.lists.MagicItemsList[key];
            const vm = global.main.formatters.item_card.build_vm(model);

            // use a shorter description, in order to get it to fit
            vm.description = model.description;

            const html = Mustache.render(templates[type], vm, templates);
            card.replaceWithHTML(html);
        }

        /*
        const spells = data.spells;

        const keys = new Set(cards.map(_ => _.dataset.key))
        const [spells_that_fit, spells_that_overflow] = spells.reduce((acc, spell) => {
            // maps bool to 0 or 1 (the group index)
            const group_index = Number(keys.has(spell.key));
            acc[group_index].push(spell);
            return acc;
        }, [[], []]);

        data.spells = spells_that_fit;
        data.spells_that_overflow = spells_that_overflow

        render(data, 1);
        */

    }

    function findOverflowingCards() {
        const cards = document.querySelectorAll('.card');
        const overflowing = [];

        cards.forEach(card => {
            if (card.scrollHeight > card.clientHeight) {
                overflowing.push(card);
                card.className = card.className + " overflowing"
            }
        });

        console.debug(`Found ${overflowing.length} overflowing cards: %o`, overflowing);
        return overflowing;
    }

    global.main.render = render

})(window)