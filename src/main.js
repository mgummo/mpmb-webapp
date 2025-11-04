(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    class Main {

        constructor() {

            // this is initalized when init() is called
            this.config = {};

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
            for (const spell of manifest.spells) {
                spell.vm = this.formatters.spell_card.build_spellcard_vm(spell, data.caster, caster_stats)
            }

            // build up view model that binds to the card
            for (const monster of manifest.monsters) {
                monster.vm = this.formatters.monster_card.build_monstercard_vm(monster)
            }

            return manifest;
        }

        get_print_manifest(config, data) {

            const spells_all = data.spells;
            const all_monsters = data.monsters;

            const caster = data.caster;

            const spell_filter = build_filter(config.layout["spell-cards"].filter);
            const spells_filtered = Object.values(spells_all).filter((spell) => spell_filter(spell, caster));

            // todo: make this configurable
            const spells_sorted = sort_spells(spells_filtered);

            const monsters = (() => {
                if (!config.layout["monster-cards"]) {
                    return []
                }

                const monster_filter = build_filter(config.layout["monster-cards"].filter);
                const monsters = Object.values(all_monsters).filter((monster) => monster_filter(monster))
                return monsters;
            })()

            return {
                spells: spells_sorted,
                monsters,
            };
        }

    }

    // todo: i haven't tested this yet
    function build_filter(filter_factory, context) {

        if (typeof filter_factory !== "function") {
            throw "invalid filter definition"
        }

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
