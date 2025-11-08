(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    class Main {

        constructor() {

            // this is initalized when init() is called
            this.config = undefined;

            // initialized by loader.js
            this.loader = undefined;

            // initialized by formatters/base.js
            this.formatters = undefined;

            // populated by various modules that need to register their types
            // (to make available for inheritance, etc.)
            this.types = {}
        }

        // after other plugins have been loaded
        async init() {

            await this.loader.load_config();
            var data = await this.loader.run();

            const manifest = this.get_print_manifest(this.config, data);

            // todo: handle multi-casting by passing in customizing caster_stats
            const caster_stats = data.caster.class;

            // build up view model that binds to the card
            for (const spell of manifest.spells ?? []) {
                spell.vm = this.formatters.spell_card.build_spellcard_vm(spell, data.caster, caster_stats)
            }

            // build up view model that binds to the card
            for (const monster of manifest.monsters ?? []) {
                monster.vm = this.formatters.monster_card.build_monstercard_vm(monster)
            }

            return manifest;
        }

        get_print_manifest(config, data) {

            const spells = this._layout_spells(config, data);
            const monsters = this._layout_monsters(config, data);

            return {
                spells,
                monsters,
            };
        }

        _layout_spells(config, data) {
            const spells_all = data.spells;
            const all_monsters = data.monsters;

            const caster = data.caster;

            const layout = config.layout["spell-cards"];
            if (!layout) {
                return []
            }

            const fn_preprocess = layout.preprocess ?? (() => Object.values(spells_all));
            const fn_filter = build_filter(layout.filter, caster);
            const fn_sort_compare = config.layout["spell-cards"].sort;

            let spells = fn_preprocess(caster);
            let spells_filtered = spells;
            if (fn_filter) {
                spells_filtered = spells.filter((spell) => fn_filter(spell, caster));
            }

            let spells_sorted = spells_filtered;
            if (fn_sort_compare) {
                spells_sorted = spells_filtered.sort(fn_sort_compare);
            }

            return spells_sorted;
        }

        _layout_monsters(config, data) {

            const caster = data.caster;

            const layout = config.layout["monster-cards"];
            if (!layout) {
                return []
            }

            const fn_preprocess = layout.preprocess ?? (() => Object.values(data.monsters));
            const fn_filter = build_filter(layout.filter, caster);
            const fn_sort_compare = layout.sort;

            let items = fn_preprocess(caster);
            let items_filtered = items;
            if (fn_filter) {
                items_filtered = items.filter((spell) => fn_filter(spell, caster));
            }

            let items_sorted = items_filtered;
            if (fn_sort_compare) {
                items_sorted = items_filtered.sort(fn_sort_compare);
            }

            return items_sorted;

        }

    }

    function build_filter(filter_factory, context) {

        if (!filter_factory) {
            return null;
        }

        if (typeof filter_factory !== "function") {
            throw "invalid filter definition"
        }

        // todo: might make sense to get rid of this flexibility and go through preprocess instead, for global context filter
        // Check how many parameters the function declares
        if (filter_factory.length != 1) {
            // It's the 2-arg form: (item, context)
            return filter_factory
        }

        // Otherwise, its in factory form
        const filter = filter_factory(context);
        if (typeof filter === "function") {
            return filter;
        }

        // Execpt it didn't return a function. So it prob took in a single item param
        return filter_factory;
    }

    function sort_spells(spells) {
        spells = spells.sort((lhs, rhs) => {

            if (lhs.level < rhs.level) return -1;
            if (lhs.level > rhs.level) return 1;

            if (lhs.name < rhs.name) return -1;
            if (lhs.name > rhs.name) return 1;

            return 0;
        });

        return spells;
    }


    global.main = new Main()

})(window)
