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
            get_cantrip_dice_amount,
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
        feat_card: {
            build_featcard_vm: unknown,
        }
    };

    types: {
        BaseFormatter?: BaseFormatter
    };
    loader: unknown;
}