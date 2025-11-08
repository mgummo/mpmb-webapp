interface Main {
    config: {
        load_character: () => void;
        plugins: string[];
    };

    formatters: {
        base: unknown;
        attack: {
            format_range,
            format_damage_dice,
            format_damage_expression,
        };
        monster_card: unknown;
        spell_card: {
            build_spellcard_vm(
                spell: *,
                character: Character,
                stats: SpellCasterStats,
                casting_context: *
            )
        };
    };

    types: {
        BaseFormatter: BaseFormatter
    };
    loader: unknown;
}