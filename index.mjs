// Exceeding this is a likely indicator of infinite recursion, or a significantly over-complicated Grammar
const MAX_LEVEL=1024; 

export class Grammar {
    _def; // Original Grammar Input (for reference/debugging)
    _re = {}; // Built Regexes (TOP and components)

    /** Construct a new Grammar with given definition.
     *
     * @param def An object where keys are rule names, and values are
     * RegExp objects or strings. At a minimum, a 'TOP' rule must be
     * defined.
     */
    constructor(def) {
        // Validate input is an object, and that it contains a TOP definition
        if (typeof def !== 'object' || !def.TOP) {
            throw "Invalid input";
        }

        this._def = def;

        // Recursively parse definitions, throwing an exception in the event if any error is encountered, or depth limit is exceeded
        this._build('TOP');

    }
    
    /** Internal function to recursively build regex for the given key.
     * @param key Name of rule to be parsed
     * @param level Recursion level. If this exceeds Grammar.MAX_DEPTH, we throw an exception with the assumption that we have a Grammar with an illegal infinitely recursive definition.
     */
    _build(key, level=0) {
        if (level > MAX_LEVEL) {
            throw "Exceeded maximum recursion depth. Input may have a cyclic dependency";
        }
        const rule = this._def[key];
        if (!rule) {
            throw key + " is not a defined grammar rule";
        }

        var src;
        if (typeof rule == "string") {
            src = rule.replace(/\s+/g,"\\s*");
        } else if (rule instanceof RegExp) {
            src = rule.source;
        } else {
            throw key + " is not a recognized Grammar input type (regex object or string(";
        }
        var cache = {};
        const pattern = src
              .replace(/\$(\w+)/g, (match, name) => {
                  if (!this._re[name]) {
                      // Parse new child element
                      this._build(name, level+1);
                  }
                  const parser = this._re[name];
                  
                  /* Regex based on NPM Package regular-grammar
                   *  Simple grammars will work directly, Unclear what this original regex did, aside from cleaning up some harmless duplicate groupings that could be avoided through better grammar definition
                   */
                  var rtv = parser.source
                  //                .replace(/\((?!\?:)/g, '(?:')
                  //                .replace(/(\\\\)*\\\(\?:/g, '$1\\(')
                  ;
                  
                  // And extend with named capture groups for each sub-component
                  return `(?<${name}>${rtv})`;
              })
        
        // Second-stage to ensure uniqueness of all named capture groups
              .replace(/\(\?<((?:[A-Za-z][^_\W]+_?)+)(\d+)?>/g,
                       (match, name, num) => {
                           // Prepend key, and remove any trailing slashes/indexes
                           var newName = key + '_' + name.replace(/_$/,"");

                           if (cache[newName]) {
                               return `(?<${newName}_${cache[newName]++}>`;
                           } else {
                               cache[newName] = 1;
                               return `(?<${newName}>`;
                           }
                       });
        ;
        //console.log("Parsing ", key, " = ", pattern); // debug

        this._re[key] = new RegExp(pattern);
    }
    /** Retrieve the built top-level RegExp */
    get regex() {
        return this._re.TOP;
    }
    /** Apply this Grammar to the given string.
     * @param str String to evaluate
     * @param key If specified, evaluate against this sub-rule instead of 'TOP'
     * @returns RegExp match results.
     */
    match(str,key='TOP') {
        if (!this._re[key]) {
            this._build(key);
        }
        return str.match(this._re[key]);
    }
    /** Describe this Grammar (TODO) */
    describe() {
        console.log(this._re.TOP); // DEBUG/TODO
    }
    
}
