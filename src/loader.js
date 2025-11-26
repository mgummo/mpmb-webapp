(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;
    const main = global.main;

    class Loader {

        // loads config
        async load_config() {
            await this.load_plugin("../etc/config.js");

            const defaults = {
                plugins: [],
            }

            if (!main.config) {
                main.config = {
                    load_character: () => { },
                    plugins: [],
                }
            }

            main.config = {
                ...defaults,
                ...main.config,
            }
        }

        // loads data specified in config
        async run() {
            await this._load_plugins(main.config.plugins)
            const data = this._normalize(mpmb)
            return data
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

        // normalizes all data that was loaded into mpmb
        _normalize(mpmb) {
            this.normalize_spells(mpmb.lists.SpellsList);
            this.normalize_creatures(mpmb.lists.CreatureList);
            this.normalize_weapons(mpmb.lists.WeaponsList);
            this.normalize_feats(mpmb.lists.FeatsList);
            this.normalize_classes(mpmb.lists.ClassList);

            let character = main.config.load_character();
            character = this.normalize_character(character);

            return {
                caster: character,
                spells: mpmb.lists.SpellsList,
                monsters: mpmb.lists.CreatureList,
            };
        }

        normalize_character(character) {

            // todo: this isn't working how I expect it
            // mods are being initialized to null instead of calculated
            mpmb.CalcAllSkills(false);
            console.log("pdf fields: %o", global.app.getFields())

            return character;
        }

        normalize_spells(SpellsList) {
            const context = {
                warnings: []
            }
            for (const [key, spell] of Object.entries(SpellsList)) {
                context.key = key
                const result = this.normalize_spell(spell, context);
                if (!result) {
                    delete SpellsList[key];
                }
            }

            if (context.warnings.length) {
                console.debug("The following spells had validation warnings: %o", context.warnings)
            }

        }

        /**
         * @param {Mpmb_Spell} spell 
         * @param {*} context - caller iteration context 
         */
        normalize_spell(spell, context) {

            /** 
             * @type {SpellDefinition} 
             * @ts-ignore */
            const result = spell;

            const key = context.key;

            // todo: build this up as an array, to cut down on log noise
            // ensure required properties are defined
            if (!spell.source) {
                spell.source = [['HB', 0]]

                const message = "%o is ill-formed: missing source property";
                context.warnings.push([message, spell])
            }

            if (!spell.classes) {
                result.classes = []

                const message = "%o is ill-formed: missing classes property"
                context.warnings.push([message, spell])
            }

            // remove obsolete spells
            if (spell.source[0][0] === "LEGACYSPELLS") {
                return false;
            }

            // extend spell object with properties that make it easier to work with:

            // spells are easier to work with, if they have a key property
            result.key = key

            // todo: there's already a allowUpCasting property?
            // result.upcastable = spell.description.includes('/SL');

            // link together the spell with the actions (from the weapon list that it enables)
            result.action = mpmb.lists.WeaponsList[key];

            result.description = this.normalize_description(spell);

            // if (!result.action) {
            //     result.action = [];
            // }

            // for (const weapon of result.actions) {

            //     if (!weapon) {
            //         continue;
            //     }

            //     // support rolling multiple types of damage dice
            //     {
            //         if (!weapon.damage) {
            //             weapon.damage = []
            //         }
            //         // if array, need to normalize into a multi-array 
            //         else if (typeof (weapon.damage[0]) !== "object") {
            //             weapon.damage = [weapon.damage]
            //         }
            //     }
            // }

            // todo: build up the saving throw stats
            // if (spell.save && !spell.action.save)

            return spell;

        }

        normalize_description(entity) {

            let description = {
                concise: null,
                summary: null,
                full: null,
            };

            if (!entity.description) {

                let full = entity.descriptionFull;
                if (Array.isArray(full)) {
                    full = full.join("\n")
                }

                description = {
                    concise: null,
                    summary: null,
                    full,

                }
            }
            else if (typeof (entity.description) !== "object") {
                const concise = entity.descriptionCantripDie ?? entity.description ?? null;
                const summary = null;
                let full = entity.descriptionFull;
                if (Array.isArray(full)) {
                    full = full.join("\n")
                }
                description = {
                    concise,
                    summary,
                    full,
                };
            }
            else {
                description = entity.description
            }

            if (!description.summary) {
                description.summary = description.full
            }

            return description;
        }

        normalize_description_2(entity) {

            let description = {};

            if (typeof (entity.description) !== "object") {
                let full = entity.description;

                description = {
                    concise: null,
                    summary: null,
                    full,
                };
            }
            else {
                description = entity.description
            }

            if (!description.summary) {
                description.summary = description.full
            }

            return description;
        }

        normalize_classes(list) {
            for (const [class_name, def] of Object.entries(list)) {
                for (const [feat_name, feat] of Object.entries(def.features)) {
                    feat.type = "class";

                    feat.from = feat.from ?? {
                        key: class_name,
                        level: feat.minlevel,
                        display: class_name.toTitleCase(),
                        // ${character_class.toTitleCase()} (${feat.from.key.toTitleCase()})
                    }

                    feat.description = this.normalize_description_2(feat);

                }
            }
        }

        normalize_feats(list) {
            for (const [key, feat] of Object.entries(list)) {
                feat.key = key;
                const result = this.normalize_feat(feat);
                if (!result) {
                    delete list[key];
                }
            }
        }

        /** 
         * @param {Mpmb_Feat} feat
         * */
        normalize_feat(feat) {
            const result = feat;

            if (result.name.includes(" [Origin]")) {
                result.name = result.name.replace(" [Origin]", "")
                result.type = 'origin'
            }

            if (!result.type) {
                result.type = ""
            }

            return result;
        }


        normalize_creatures(CreaturesList) {
            for (const [key, creature] of Object.entries(CreaturesList)) {
                const result = this.normalize_creature(creature, key);
                if (!result) {
                    delete CreaturesList[key];
                }
            }
        }

        normalize_creature(creature, key) {

            // entities are easier to work with, if they have an id
            creature.key = key;

            // mpmb supports creatures with mulitple sizes
            // standardize on an array for this property
            creature.size = castArray(creature.size);

            creature.type = castArray(creature.type);
            creature.subtype = castArray(creature.subtype)

            creature.abilities = this.build_ability_stats(creature)

            this.calc_save_mods(creature);

            this.fixup_skills(creature);
            creature.defenses = this.build_defenses(creature);

            // todo: should this be typed as an array?
            creature.languages = creature.languages ?? ""
            creature.languages = creature.languages.replace(/^understand/, 'Understand')

            creature.gear = creature.gear ?? []

            creature.cr = this._normalize_cr(creature);
            creature.xp = this._normalize_xp(creature);
            creature.pb = this._normalize_pb(creature);

            // backwards compatiblity
            creature.proficiencyBonus = creature.pb;

            creature.features = this._normalize_features(creature);

            return creature;
        }

        _normalize_features(creature) {

            let stashed_features = [];
            if (Array.isArray(creature.features)) {
                stashed_features = creature.features;
            }

            const stashed_traits = this._normalize_traits(creature, creature.traits)
            const stashed_attacks = this._normalize_traits(creature, creature.attacks)
            const stashed_actions = this._normalize_traits(creature, creature.actions)
            const stashed_notes = creature.notes ?? []

            // unclear how features & notes differ from traits and attacks
            // just stuff them into traits
            const traits = [
                ...this._normalize_traits(creature, creature.features?.traits),
                ...stashed_traits,
                ...stashed_features,
                ...stashed_notes,
            ]

            const attacks = [
                ...this._normalize_traits(creature, creature.features?.attacks),
                ...stashed_attacks
            ]
            const actions = this._normalize_traits(creature, creature.features?.actions)
            const bonus_actions = this._normalize_traits(creature, creature.features?.bonus_actions)
            const reactions = this._normalize_traits(creature, creature.features?.reactions)

            for (const attack of attacks) {
                if (!attack.range) {
                    attack.range = "Melee"
                    const message = "%o is ill-formed: missing range property in one of its attacks"
                    // context.warnings.push([message, creature])
                    console.warn(message, creature)
                }

                attack.damage = this._normalize_damages(creature, attack.damage);
                attack.modifiers = attack.modifiers ?? [0, 0]
            }

            return {
                traits,
                actions,
                attacks,
                bonus_actions,
                reactions
            }

        }

        _normalize_cr(creature) {
            if (creature.cr != null) {
                return creature.cr
            }

            let cr = creature.challengeRating;
            if (typeof (cr) == "string") {
                if (cr == "1/8" || cr == "1/4" || cr == "1/2") {
                    return cr;
                }
                cr = +cr;
            }

            return cr;
        }

        _normalize_xp(creature) {

            if (creature.xp != null) {
                return creature.xp
            }

            return this._cr_lookup_table(creature.cr)[0];


        }
        _normalize_pb(creature) {
            if (creature.pb != null) {
                return creature.pb;
            }

            if (creature.proficiencyBonus != null) {
                creature.proficiencyBonus
            }

            return this._cr_lookup_table(creature.cr)[1];

        }

        _cr_lookup_table(cr) {
            switch (cr) {
                case 0: return [0, 2]; // mm says 0 or 10 xp
                case "1/8": return [25, 2];
                case "1/4": return [50, 2];
                case "1/2": return [100, 2];
                case 1: return [200, 2];
                case 2: return [450, 2];
                case 3: return [700, 2];
                case 4: return [1100, 2];
                case 5: return [1800, 3];
                case 6: return [2300, 3];
                case 7: return [2900, 3];
                case 8: return [3900, 3];
                case 9: return [5000, 4];
                case 10: return [5900, 4];
                case 11: return [7200, 4];
                case 12: return [8400, 4];
                case 13: return [10000, 5];
                case 14: return [11500, 5];
                case 15: return [13000, 5];
                case 16: return [15000, 5];
                case 17: return [18000, 6];
                case 18: return [20000, 6];
                case 19: return [22000, 6];
                case 20: return [25000, 6];
                case 21: return [33000, 7];
                case 22: return [41000, 7];
                case 23: return [50000, 7];
                case 24: return [62000, 7];
                case 25: return [75000, 8];
                case 26: return [90000, 8];
                case 27: return [105000, 8];
                case 28: return [120000, 8];
                case 29: return [135000, 9];
                case 30: return [155000, 9];
                default: return [null, null];
            }
        }

        _normalize_traits(creature, traits) {

            // if traits == null
            if (!traits) {
                return []
            }

            // if traits == {}
            if (Object.keys(traits).length === 0) {
                return []
            }

            // if traits == [{}]
            if (traits.length === 1 && Object.keys(traits[0]).length === 0) {
                return []
            }

            return castArray(traits)
        }


        /**
         * @param { (number|string)[][] | (number|string)[] | null} input 
         * @returns { Array<DamageExpression> }
         */
        _normalize_damages(creature, input) {

            if (!input) {
                return [];
            }

            if (input.length == 3 && !input[0] && !input[1] && !input[2]) {
                return []
            }

            /** @type {(number|string)[][]} */
            let input_as_array = [];
            if (!Array.isArray(input[0])) {
                input_as_array = [/** @type {(number|string)[]} */ (input)]
            }
            else {
                input_as_array = /** @type {(number|string)[][]} */ (input);
            }

            /** @type {DamageExpression[]} */
            const damages = [];

            for (const damage of input_as_array) {
                if (damage.length == 3) {
                    damages.push([
                        /** @type {number} */ (damage[0]),
                        /** @type {number} */ (damage[1]),
                        "damage_mod",
                        /** @type {DamageType} */ (damage[2])
                    ]);
                }
                else if (damage.length == 4) {
                    damages.push(/** @type {DamageExpression} */(damage));
                }
            }

            return damages;
        }

        normalize_weapons(list) {
            for (const [key, weapon] of Object.entries(list)) {
                const result = this.normalize_weapon(weapon, key);
                if (!result) {
                    delete list[key];
                }
            }
        }

        normalize_weapon(weapon, key) {
            // support rolling multiple types of damage dice
            {
                if (!weapon.damage) {
                    weapon.damage = []
                }
                // if array, need to normalize into a multi-array 
                else if (typeof (weapon.damage[0]) !== "object") {
                    weapon.damage = [weapon.damage]
                }
            }

            return weapon;

        }

        calc_save_mods(creature) {

            if (!creature.abilities) { return; }

            // [Str, Dex, Con, Int, Wis, Cha]
            const base_save = [
                creature.abilities.str.save_mod,
                creature.abilities.dex.save_mod,
                creature.abilities.con.save_mod,
                creature.abilities.int.save_mod,
                creature.abilities.wis.save_mod,
                creature.abilities.cha.save_mod
            ]

            const deltas = [undefined, undefined, undefined, undefined, undefined, undefined,]
            for (let i = 0; i < 6; i++) {
                const x = base_save[i]
                const maybe_adjusted = creature.saves?.[i];
                const adjusted = (function (maybe_adjusted, x) {
                    if (maybe_adjusted == null) {
                        return x;
                    }
                    if (typeof (maybe_adjusted) == "undefined") {
                        return x;
                    }
                    if (maybe_adjusted == "") {
                        return x;
                    }
                    return maybe_adjusted;

                })(maybe_adjusted, x)

                const delta = adjusted - x
                if (delta != 0) {
                    // todo: reset save_mod to adjusted value
                    // if delta == prof_bonus then assume has saving throw prof.
                    // otherwise we have an edge case, where there's a saving throw adjustment.
                    if (delta != creature.proficiencyBonus) {
                        debugger;
                    }
                }
                deltas[i] = delta;
            }
        }

        // todo: add prof bonus to save_mod if prof
        // (see calc_save_mods)
        // [Str, Dex, Con, Int, Wis, Cha]
        build_ability_stats(creature) {

            const scores = creature.scores;
            const saves = creature.saves ?? [null, null, null, null, null, null]

            if (!scores) {
                return;
            }

            for (let i = 0; i < 6; i++) {
                const save_mod = saves[i];
                if (save_mod == null || save_mod === "") {
                    const mod = this.calc_ability_mod(scores[i]);
                    saves[i] = mod;
                }
            }

            const abilities = {
                'str': {
                    score: scores[0],
                    mod: this.calc_ability_mod(scores[0]),
                    save_mod: saves[0],
                    // save_mod: this.calc_ability_mod(scores[0])
                },
                'dex': {
                    score: scores[1],
                    mod: this.calc_ability_mod(scores[1]),
                    save_mod: saves[1],
                    // save_mod: this.calc_ability_mod(scores[1])
                },
                'con': {
                    score: scores[2],
                    mod: this.calc_ability_mod(scores[2]),
                    save_mod: saves[2],
                    // save_mod: this.calc_ability_mod(scores[2])
                },
                'int': {
                    score: scores[3],
                    mod: this.calc_ability_mod(scores[3]),
                    save_mod: saves[3],
                    // save_mod: this.calc_ability_mod(scores[3])
                },
                'wis': {
                    score: scores[4],
                    mod: this.calc_ability_mod(scores[4]),
                    save_mod: saves[4],
                    // save_mod: this.calc_ability_mod(scores[4])
                },
                'cha': {
                    score: scores[5],
                    mod: this.calc_ability_mod(scores[5]),
                    save_mod: saves[5],
                    // save_mod: this.calc_ability_mod(scores[5])
                },

            }
            return abilities;
        }

        calc_ability_mod(score) {
            const mod = Math.floor((score - 10) / 2);
            return mod;
        }

        fixup_skills(monster) {
            monster.skills = monster.skills ?? {};

            if (Array.isArray(monster.skills)) {
                const result = {}
                for (const elem of monster.skills) {
                    for (const [skill, mod] of Object.entries(elem)) {
                        result[skill] = mod;
                    }
                }
                monster.skills = result;
            }
        }

        build_defenses(monster) {

            const dv = parse_list(monster.damage_vulnerabilities)
            const dr = parse_list(monster.damage_resistances)
            const di = parse_list(monster.damage_immunities)
            const ci = parse_list(monster.condition_immunities)

            // const v = parse_list(monster.vulnerabilities)
            // const r = parse_list(monster.resistances)
            // const i = parse_list(monster.immunities)

            // not sure what these do - but these don't appear to be set?
            if (monster.vulnerabilities) { debugger; }
            if (monster.resistances) { debugger; }
            if (monster.immunities) { debugger; }

            const defenses1 = {
                damage_vulnerabilities: monster.defenses?.damage_vulnerabilities ?? [],
                damage_resistances: monster.defenses?.damage_resistances ?? [],
                damage_immunities: monster.defenses?.damage_immunities ?? [],
                condition_immunities: monster.defenses?.condition_immunities ?? [],
            }

            const defenses2 = {
                damage_vulnerabilities: [...defenses1.damage_vulnerabilities, ...dv],
                damage_resistances: [...defenses1.damage_resistances, ...dr],
                damage_immunities: [...defenses1.damage_immunities, ...di],
                condition_immunities: [...defenses1.condition_immunities, ...ci],
            };

            return defenses2;
        }
    }

    function parse_list(text) {
        if (!text) {
            return []
        }

        return text.split(",")
            .map(token => token
                .trim()
                .replace(/^and\s+/i, '')
                .toTitleCase()
            )
            .filter(token => token.length > 0);
    }



    const loader = new Loader();

    global.main.loader = loader;

})(window)
