(function (global) {

    // after other plugins have been loaded
    function init() {

        const result = {};

        ExtendWeaponsList(mpmb.lists.WeaponsList)
        ExtendSpellsList(mpmb.lists.SpellsList)

        const dict = load_pdf()
        const caster = load_character(dict)
        result.spells = select_spells_to_render(caster);

        return result;
    }

    function ExtendWeaponsList(list) {

        mpmb.UpdateWeapon("chill touch", {
            range: "Melee",
        })

        // fix description
        mpmb.UpdateWeapon("produce flame", {
            range: "60 ft",
            description: "20-ft radius bright light and 20-ft radius dim light until thrown",
        });

        mpmb.UpdateWeapon("thorn whip", {
            range: "30 ft Melee"
        });

        // fix dc skill
        mpmb.UpdateWeapon("thunderclap", {
            ability: 3,
            dc: ["Con", null, "takes no damage"],
        });

        // define attacks for higher level spells
        mpmb.AddWeapon("thunderwave", {
            regExpSearch: /^(?=.*thunderwave).*$/i,
            name: "Thunderwave",
            source: ['P24', 334],
            list: "spell",
            useSpellcastingAbility: false,
            ability: 2, // con
            type: "Spell",
            damage: [["2", 8, "thunder"], ["USL", 8, 'thunder']],
            range: "self 15-ft cube",
            description: "All crea/unsecured obj 2d8+1d8/SL Thunder, pushed 10 ft away; save 1/2 dmg only; audible 300ft",
            abilitytodamage: false,

            // attempt to extend the def. with what happens on save
            dc: ["Con", null, "takes half damage"],

            // todo: get rid of this
            save: ["Con", null, "takes half damage"]
        });

        // todo: is this a con save / wis save or what?
        // I think I need to review the convulted modifier calcs
        // from the attacks table
        // Word of Radiance | Yes | Wis | 5-ft. radius | DC 10 | 1d6 | Radiant
        // Con save, success - no damage; Only chosen creatures I can see are affected

        // What I'd like the card to say:
        // Each target within a 5-foot radius from you makes a Con saving throw (DC 10)
        // On failure, they are dealt 1d6 Radiant damage.
        // On success, they are dealt no damage.

        // const radiance = WeaponsList["word of radiance"];
        // console.debug(radiance);

        // todo: healing word
        // "1 creature heals 2d4+2d4/SL+5 (Wis) HP"

    }

    function ExtendSpellsList(SpellsList) {

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
            spell.action = WeaponsList[spell.key]

            // if (spell.save && !spell.action.save)

        }

    }

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

    function select_spells_to_render(caster) {
        // let spells = SelectSpells(mpmb.lists.SpellsList)
        // let spells = SelectAllSpells(mpmb.lists.SpellsList)
        let spells = SelectAvailableSpells(caster.class, [0, 2])

        spells = spells.sort((lhs, rhs) => {

            if (lhs.level < rhs.level) return -1;
            if (lhs.level > rhs.level) return 1;

            if (lhs.name < rhs.name) return -1;
            if (lhs.name > rhs.name) return 1;

            return 0;
        });

        // build up view model that binds to the card
        for (spell of spells) {
            spell.vm = build_spellcard_vm(spell, caster)
        }

        // Let's see if we have anything
        console.info(spells)

        // dump the informatkion i'm currently degguking
        // not found for some reason?
        // let temp = spells.find((spell) => {
        //     return spell.key === "thunderwave"
        // })
        // temp = spells[11]
        // console.info({ summary: temp.vm.summary, description: temp.vm.descriptionHtml })

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
        let spells = Object.values(SpellsList);
        return spells;
    }

    function SelectAvailableSpells(caster_class, spell_level_range) {
        let spells = Object.values(SpellsList);
        spells = spells.filter(_ => {

            if (!_.classes) {
                debugger;
            }

            const match_class = _.classes.includes(caster_class);
            const match_min = _.level >= spell_level_range[0];
            const match_max = _.level <= spell_level_range[1];
            return match_class && match_min && match_max;
        });

        return spells;
    }

    // https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet/tree/main/additional%20content%20syntax

    // schema definition for objects in WeaponsList:
    // https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet/blob/main/additional%20content%20syntax/weapon%20(WeaponsList).js

    // todo: pass a casting context
    // include things like the caster, upcasted spell slots,k bonuses, etc.
    function build_spellcard_vm(spell, caster, casting_context) {
        const vm = {};

        // vm.title = ... ommitted - no need to format the spell title
        vm.subtitle = format_spell_subtitle(spell)

        vm.summary = format_spell_summary(spell, caster);

        vm.time = format_spell_time(spell);
        vm.range = format_spell_range(spell);
        vm.components = format_spell_components(spell);
        vm.duration = format_spell_duration(spell);

        vm.descriptionHtml = format_spell_description(spell);

        vm.source = format_spell_source(spell);

        return vm;
    }

    global.main = {
        init: init
    }

})(window)
