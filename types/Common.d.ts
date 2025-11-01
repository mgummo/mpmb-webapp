/**
 *  Used to define which source book(s) the entity is defined.
 * 
 * @remarks
 * This attribute is used by the sheet to determine if the entity should be available depending on the sources included and excluded.
 * 
 * This array has two entries, a string followed by a number.
 * 1. string  
 *    The first entry is the key of a SourceList object.
 * 2. number  
 *    The second entry is the page number to find the entity at.  
 *    This can be any number and is ignored if it is a 0.  
 * See the "source (SourceList).js" file for learning how to add a custom source.
 * 
 * Alternatively, this can be an array of arrays to indicate it appears in multiple sources.
 * The 2nd example says the entity is defined in 2 places: page 7 of the Elemental Evil Player's Companion and on page 115 of the Sword Coast Adventure Guide.
 * 
 * If the entity is homebrew and you don't want to define a custom source, you can use the homebrew source 'H'  
 * `source: ["HB", 0],`  
 * "HB" refers to the 'homebrew' source.  
 * 
 * @example ["SRD", 204]
 * @example [["E", 7], ["S", 115]]
 * @example ["HB", 0]
 */
type SourceList = Arrayable<[SourceKey, Page]>;
type SourceKey = string
type Page = number