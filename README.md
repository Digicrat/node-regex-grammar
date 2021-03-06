A library to aide in construction of complex regular expressions that are easier to maintain and read.  Install with "npm install regex-grammar".

```
// Note: This is for demonstration purposes only. URLSearchParams is a better approach for this particular example of parsing urls.
const URL_GRAMMAR = {
    TOP: "$proto? $domain $path? $params? $bookmark?", // In string form, all whitespace is ignored. Specifically " " is treated as "\s*"
    proto: "(\\w+)://",
    domain: /[\w\.]+/,
    path: new RegExp("[\\w\\-/]+"), // Recall: String form requires escaping of '/'
    params: /\?((?<key>\w+)=(?<val>\w+)&?)+/,
    bookmark: /#.+/
};
const urlGrammar = new Grammar(URL_GRAMMAR);
urlGrammar.describe();
console.log(urlGrammar.match("http://foo.bar.com/api/do?param=something&more=less#foo"));
```

This library is inspired in part by Perl6/Raku's Grammars and the [regular-grammar](https://www.npmjs.com/package/regular-grammar) library.  Test cases  have been directly adapted from the regular-grammar library.

See index.mjs for additional documentation (TODO: Export to HTML), and test.mjs for examples.

## Key Features

- 'TOP' always defines the top level of a Grammar, which is the default entry point for nominal matching.
- A grammar key can be referenced from any other key using the syntax '$key', however cyclic references are not supported.  ie: Rule 'foo' can't refer to rule 'bar' if it refers back to foo.
- The 'match' function will return results equivalent to String.match.  This result set may be extended in future versions with additional functionality.
- At present all grammar rules must be defined as either a RegExp or a string.  This is roughly equivalent to Perl6/Raku's rules vs tokens.
  - A regular expression can be defined in the normal ways as "/foo/" or "new RegExp(...)"
  - A string will be treated as a pattern used to create a new RegExp, but where whitespace is insignificant. Specifically, any whitespace in the input string will become "\s*" in the built regular expression.  
- Named capture groups will be automatically created for each rule/token.  
  - Group names will be prefixed with the name of the parent group as applicable, and suffixed with an integer if not unique (ie: for repeated patterns)


## Future Enhancement Thoughts
- Ability to escape rule variable ('$') and/or specify an alternate delimiter.
- Parse named capture groups after match into a tree-like hierarchy reflecting the original rule definition.
- Debug options to trace Regex evaluation, if possible. At a minimum, expand describe function to provide a more useful view.
- Ability to define arbitrary subrules.  
  - This may take the form of a third type of rule definition consisting of an object defining
    - A RegExp rule to match, as with standard rules
    - A discrete Grammar Class, rule key, or custom function to parse this nested result
  - This functionality would be dependent on extending Grammar match results with tree-like representation of automatic capture groups
  - Subrule matches would be folded into Grammar.match results
