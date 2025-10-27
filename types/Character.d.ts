// the Character type (when loading a character)
interface Character {
    name: string
    player_name: string,
    level: number,
    class: CharacterClass,


}

// the Character type (when used internally)
interface Internal<Character> implements Character {
    classes: Class[],
}
