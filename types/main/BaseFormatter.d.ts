interface BaseFormatter {
    new(options?: any): BaseFormatter;

    format_ability;
    format_modifier;
    format_spell_source;

    unabbreviate;

    toTitleCase;
}