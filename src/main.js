(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

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

    class Main {

        constructor() {

            // this is initalized when init() is called
            this.config = {};

            // initialized by loader.js
            this.loader = undefined;
        }

        // after other plugins have been loaded
        async init() {

            await this.loader.load_config();
            var data = await this.loader.run();

            const manifest = this.get_print_manifest(this.config, data);

            // build up view model that binds to the card
            for (const spell of manifest.spells) {
                spell.vm = this.build_spellcard_vm(spell, data.caster)
            }

            // build up view model that binds to the card
            for (const monster of manifest.monsters) {
                monster.vm = this.build_monstercard_vm(monster)
            }

            return manifest;
        }

        get_print_manifest(config, data) {

            const all_spells = data.spells;
            const all_monsters = data.monsters;

            const caster = data.caster;

            const spell_filter = build_filter(config.layout["spell-cards"].filter);
            const spells = Object.values(all_spells).filter((spell) => spell_filter(spell, caster));

            const monster_filter = build_filter(config.layout["monster-cards"].filter);
            const monsters = Object.values(all_monsters).filter((monster) => monster_filter(monster))

            return {
                spells,
                monsters,
            };
        }

        build_spellcard_vm(spell, caster, casting_context) {
            // Initially undefined - defined in format.js
            throw new Error("build_spellcard_vm not yet initialized");
        }

        build_monstercard_vm(spell, caster, casting_context) {
            // Initially undefined - defined in format.js
            throw new Error("build_spellcard_vm not yet initialized");
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


    global.main = new Main()

})(window)
