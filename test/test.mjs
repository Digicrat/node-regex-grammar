import {Grammar} from '../index.mjs';
import mocha from 'mocha';
import {assert,expect} from 'chai';

describe('Grammar fails gracefully on bad input', () => {
    it('Fails if TOP is not given', () => {
        expect( () =>  new Grammar({'foo': /foo/})).to.throw();
    });
    it('Fails if Grammar references non-existent rule', () => {
        expect( () =>  new Grammar({'TOP': "$foo $bar"})).to.throw();
    });
    // TODO: Ability to escape $
});

describe('Baby English Base Test', () => {
    const BABY_ENGLISH = {
        
        WORD: /\w+/,
        ADJECTIVE: /good|bad/,
        TOP: /($ADJECTIVE)\s+($WORD)/
        
    };
    const babySentenceGrammar = new Grammar(BABY_ENGLISH);

    it('Match good dog', () => {
        var result = babySentenceGrammar.match('good dog');
        assert.exists(result);
        assert.equal(result.groups.TOP_ADJECTIVE, 'good');
        assert.equal(result.groups.TOP_WORD, 'dog');
    });
    it('No evil cats allowed', () => {
        var result = babySentenceGrammar.match('evil cat');
        assert.notExists(result);
    });

});

describe('A URL Parsing Example', () => {
    // Note: This is for demonstration purposes only. URLSearchParams is a better approach for this particular example of parsing urls.
    const URL_GRAMMAR = {
        TOP: "$proto? $domain $path? $params? $bookmark?", // In string form, all whitespace is ignored. Specifically " " is treated as "\s*"
        proto: "(?<protocol>\\w+)://",
        domain: /[\w\.]+/,
        path: new RegExp("[\\w\\-/]+"), // Recall: String form requires escaping of '/'
        params: /\?((\w+)=(\w+)&?)+/,
        bookmark: /#.+/
    };

    const urlGrammar = new Grammar(URL_GRAMMAR);
    it('Matches a sample URL', () => {
        var result = urlGrammar.match("http://foo.bar.com/api/do?param=something&more=less#foo");
        assert.exists(result);
        assert.equal(result.groups.TOP_proto, "http://");
        assert.equal(result.groups.TOP_proto_protocol, "http");
        assert.equal(result.groups.TOP_domain, "foo.bar.com");
        assert.equal(result.groups.TOP_bookmark, "#foo");
    });
});


describe('A more complex example', () => {
    // Borrowed from 'regular-grammar' library as a more complex example.
    const RON_GRAMMAR = {
        
        BASE64:     /[0-9A-Za-z_~]/,
        INT:        /(?:[\([{}\])])?$BASE64{0,10}/,
        UUID:       /(?:[`\\|\/])?$INT(?:[-+$%])?$INT/,
        
        INT_ATOM:   /[+-]?\d{1,17}/,
        STRING_ATOM:/"(?:\\"|[^"])*"/,
        FLOAT_ATOM: /[+-]?\d{0,19}\.\d{1,19}(?:[Ee][+-]?\d{1,3})?/,
        UUID_ATOM:  /(?:$UUID,?)+/,
        FRAME_ATOM: /!/,
        QUERY_ATOM: /\?/,
        
        ATOM:       /=$INT_ATOM|$STRING_ATOM|\^$FLOAT_ATOM|>$UUID_ATOM|$FRAME_ATOM|$QUERY_ATOM/,
        OP:         /\s*\.?$UUID\s*#?$UUID\s*@?$UUID\s*:?$UUID\s*(?:$ATOM{1,8})/,
        TOP:      /$OP+/,
        
    };
    const ronFrameGrammar = new Grammar(RON_GRAMMAR);

    it('Frame?', () => {
        // A Frame?
        assert.exists(ronFrameGrammar.match("#id`=1#id`=1@}^0.1"));
    });

    it('Not Frame?', () => {
        // Not Frame?            
        assert.exists(ronFrameGrammar.match("#id`,``=1@2^0.2"));
    });
    
});
