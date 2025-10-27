(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    function load_pdf() {

        // simulate loading a pdf

        const pdf = {
            fields: {}
        }
        const dict = pdf.fields;

        // Guessing about fields names, since there's no documentation.
        // not working, this pointer jank?
        // Value('Character Level', 3);
        // Value('Wis Mod', +3);
        // Value('Prof Bonus', +2);

        // todo: how does multiclassing work?
        dict['Character Class'] = 'druid'
        dict['Character Level'] = 3;
        dict['Wis Mod'] = 3;
        dict['Prof Bonus'] = 2;
        dict['Spell Attack Bonus'] = dict['Prof Bonus'] + dict['Wis Mod'];
        dict['Spell Save DC'] = 8 + dict['Prof Bonus'] + dict['Wis Mod'];

        return dict;

    }

    /**
     * 
     * @param {*} dict 
     * @returns Caster
     */
    function load_character(dict) {

        // todo: d.ts file for this type

        // build the dto for the spell caster stats
        const caster = {
            level: dict['Character Level'],
            class: dict['Character Class'],
            spell_mod: dict['Wis Mod'],
            prof_mod: dict['Prof Bonus'],
            spell_attack_mod: dict['Spell Attack Bonus'],
            spell_save: dict['Spell Save DC'],
        }

        return caster;
    }

    function select_spells_to_render2() {
        const caster = {
            level: 1,
            class: "wizard",
            spell_ability: "Int",
            spell_mod: +2,
            prof_mod: +2,
            spell_attack_mod: +4,
            spell_save_dc: 12,
        }

        let spells = SelectAvailableSpells(caster.class, [0, 9])

        spells = spells.sort((lhs, rhs) => {

            if (lhs.level < rhs.level) return -1;
            if (lhs.level > rhs.level) return 1;

            if (lhs.name < rhs.name) return -1;
            if (lhs.name > rhs.name) return 1;

            return 0;
        });

        const main = global.main
        for (const spell of spells) {
            spell.vm = main.build_spellcard_vm(spell, caster)
        }

        return spells;

    }

    function select_spells_to_render(caster) {

        const SpellsList = mpmb.lists.SpellsList;

        // let spells = SelectSpells(mpmb.lists.SpellsList)
        // let spells = SelectAllSpells(mpmb.lists.SpellsList)
        let spells = SelectAvailableSpells(caster.class, [0, 2])

        const always_prepared = [
            { ...SpellsList['find familiar'], always_prepared: { "because": "Wild Companion (Druid 2, P24 81)" } },

            // Arid 
            { ...SpellsList["blur"], always_prepared: { "because": "Arid Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["burning hands"], always_prepared: { "because": "Arid Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["fire bolt"], always_prepared: { "because": "Arid Land (Druid Circle of the Land 3, P24 84)" } },

            // Polar
            { ...SpellsList["fog cloud"], always_prepared: { "because": "Polar Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["hold person"], always_prepared: { "because": "Polar Land (Druid Circle of the Land 3, P24 84)" } },

            // Temperate 
            { ...SpellsList["misty step"], always_prepared: { "because": "Temperate Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["shocking grasp"], always_prepared: { "because": "Temperate Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["sleep"], always_prepared: { "because": "Temperate Land (Druid Circle of the Land 3, P24 84)" } },

            //  
            { ...SpellsList["acid splash"], always_prepared: { "because": "Tropical Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["ray of sickness"], always_prepared: { "because": "Tropical Land (Druid Circle of the Land 3, P24 84)" } },
            { ...SpellsList["web"], always_prepared: { "because": "Tropical Land (Druid Circle of the Land 3, P24 84)" } },

        ]

        spells = [...spells, ...always_prepared]

        spells = spells.sort((lhs, rhs) => {

            if (lhs.level < rhs.level) return -1;
            if (lhs.level > rhs.level) return 1;

            if (lhs.name < rhs.name) return -1;
            if (lhs.name > rhs.name) return 1;

            return 0;
        });

        const main = global.main

        // build up view model that binds to the card
        for (const spell of spells) {
            spell.vm = main.build_spellcard_vm(spell, caster)
        }

        return spells;
    }

    function SelectSpells(SpellsList) {

        let spells = [
            SpellsList['druidcraft'],
            SpellsList['elementalism'],
            SpellsList['produce flame'],
            SpellsList['shocking grasp'],
            SpellsList['detect magic'],
            SpellsList['find familiar'],
            SpellsList['healing word'],
            SpellsList['purify food and drink'],
            SpellsList['sleep'],
            SpellsList['speak with animals'],
            SpellsList['thunderwave'],
            SpellsList['augury'],
            SpellsList['locate animals or plants'],
            SpellsList['misty step'],
        ]

        // temp, so that I have a DC Save based attack to look at
        spells = [
            SpellsList['word of radiance'], ...spells
        ]

        return spells;
    }

    function SelectAllSpells(list) {
        let spells = Object.values(list);
        return spells;
    }

    function SelectAvailableSpells(caster_class, spell_level_range) {

        const SpellsList = mpmb.lists.SpellsList;

        let spells = Object.values(SpellsList);
        spells = spells.filter(_ => {
            const match_class = _.classes.includes(caster_class);
            const match_min = _.level >= spell_level_range[0];
            const match_max = _.level <= spell_level_range[1];
            return match_class && match_min && match_max;
        });

        return spells;
    }

    class Main {

        constructor() {
            this.config = undefined;
        }

        // after other plugins have been loaded
        async init() {

            await this._load_config();
            await this._load_plugins(this.config.plugins)
            this.normalize_spells(mpmb.lists.SpellsList);

            const dict = load_pdf()
            const caster = load_character(dict)
            const spells = select_spells_to_render(caster);

            return {
                spells,
            }
        }

        async _load_config() {
            await this.load_plugin("../etc/config.js");

            const defaults = {
                plugins: [],
            }

            if (!this.config) {
                this.config = {}
            }

            this.config = {
                ...defaults,
                ...this.config,
            }
        }

        async _load_plugins(plugins) {
            if (!plugins) {
                return;
            }

            for (const plugin of plugins) {
                await this.load_plugin(plugin);
            }
        }

        load_plugin(url) {

            return new Promise((resolve, reject) => {

                const script = document.createElement('script');
                script.src = url;
                script.async = true;

                // if (resolve)
                script.onload = () => resolve(window); // resolve with global scope
                script.onerror = () => reject(new Error(`Failed to load script ${url}`));

                document.head.appendChild(script);
            });
        }

        normalize_spells(SpellsList) {

            for (const [key, spell] of Object.entries(SpellsList)) {

                // ensure required properties are defined
                if (!spell.source) {
                    console.debug(`%o is ill-formed: missing source property`, spell)
                    spell.source = [['HB', 0]]
                }

                if (!spell.classes) {
                    console.debug(`%o is ill-formed: missing classes property`, spell)
                    spell.classes = []
                }

                // remove obsolete spells
                if (spell.source[0][0] === "LEGACYSPELLS") {
                    delete SpellsList[key];
                }

                // extend spell object with properties that make it easier to work with:

                // spells are easier to work with, if they have a key property
                spell.key = key

                // todo: there's already a allowUpCasting property?
                spell.upcastable = spell.description.includes('/SL');

                // link together the spell with the actions (from the weapon list that it enables)
                spell.action = mpmb.lists.WeaponsList[spell.key]

                if (spell.action) {

                    // support rolling multiple types of damage dice
                    // todo: replace the old damage value with this value instead
                    // instead of making a new property
                    {
                        let damages = spell.action.damage;

                        if (!damages) {
                            spell.action.damages = []
                        }
                        // if array, need to normalize into a multi-array 
                        else if (typeof (damages[0]) !== "object") {
                            spell.action.damages = [damages]
                        }
                    }
                }

                // todo: build up the saving throw stats
                // if (spell.save && !spell.action.save)

            }

        }



        build_spellcard_vm() {
            // Initially undefined
            throw new Error("build_spellcard_vm not yet initialized");
        }
    }

    global.main = new Main()

})(window)
