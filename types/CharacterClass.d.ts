type TSpellKey = string

interface CharacterClass {

    class,
    subclass,

    level;
    spell_skill;
    spell_attack_mod;
    spell_save;
}

interface Subclass { }

interface SpellCaster extends CharacterClass {

    level;
    spell_skill;
    spell_attack_mod;
    spell_save;

    spells: {
        prepared: Internal<Spell>[],
        known: Internal<Spell>[],
    }


}