//
//     Copyright (C) 2008 Loic Dachary <loic@dachary.org>
//     Copyright (C) 2008 Johan Euphrosine <proppy@aminche.com>
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

module("printstacktrace");

test("printStackTrace", function() {
        expect(1);
        var r = printStackTrace();
        equals(typeof r, 'object', 'printStackTrace returns a string');
    });

test("mode", function() {
        expect(1);
        equals("firefox other opera".indexOf(printStackTrace.implementation.prototype.mode()) >= 0,true);
    });

test("run mode", function() {
        expect(1);
        var p = new printStackTrace.implementation();
        p.other = p.firefox = p.opera = function() { equals(1,1,'called'); }
        p.run();
    });

test("run firefox", function() {
        expect(1);
        var p = new printStackTrace.implementation();
        p.mode = function() { return 'firefox'; }
        p.other = p.opera = function() { equals(1,0,'must not be called'); }
        p.firefox = function() { equals(1,1,'called'); }
        p.run();
    });

test("run opera", function() {
        expect(1);
        var p = new printStackTrace.implementation();
        p.mode = function() { return 'opera'; }
        p.other = p.firefox = function() { equals(1,0,'must not be called'); }
        p.opera = function() { equals(1,1,'called'); }
        p.run();
    });

test("run other", function() {
        expect(1);
        var p = new printStackTrace.implementation();
        p.mode = function() { return 'other'; }
        p.opera = p.firefox = function() { equals(1,0,'must not be called'); }
        p.other = function() { equals(1,1,'called'); }
        p.run();
    });

test("firefox", function() {
        var mode = printStackTrace.implementation.prototype.mode();
        var e = [];
        e.push({ stack: 'discarded()...\nf1(1,"abc")@file.js:40\n()@file.js:41\n@:0  \nf44()@file.js:494'});
        if(mode == 'firefox') {
            function discarded() {
                try {(0)()} catch (exception) {
                    e.push(exception);
                }
            };
            function f1(arg1, arg2) {
                discarded();
            };
            var f2 = function() {
                f1(1, "abc");
            };
            f2();
        }
        expect(4 * e.length);
        for(var i = 0; i < e.length; i++) {
            var message = printStackTrace.implementation.prototype.firefox(e[i]);
            var message_string = message.join("\n");
            //            equals(message_string, '', 'debug');
            equals(message_string.indexOf('discarded'), -1, 'discarded');
            equals(message[0].indexOf('f1(1,"abc")') >= 0, true, 'f1');
            equals(message[1].indexOf('{anonymous}()') >= 0, true, 'f2 anonymous');
            equals(message[2].indexOf('@:0'), -1, '@:0 discarded');
        }
    });

test("opera", function() {
        var mode = printStackTrace.implementation.prototype.mode();
        var e = [];
        e.push({ message: 'discarded\ndiscarded\ndiscarded\ndiscarded\nLine 40 in http://site.com in function f1\n      info f1\nLine 44 in http://site.com\n 	info f2\ndiscarded\ndiscarded'});
        if(mode == 'opera') {
            function discarded() {
                try {(0)()} catch (exception) {
                    e.push(exception);
                }
            };
            function f1(arg1, arg2) {
                discarded();
            };
            var f2 = function() {
                f1(1, "abc");
            };
            f2();
        }
        expect(3 * e.length);
        for(var i = 0; i < e.length; i++) {
            var message = printStackTrace.implementation.prototype.opera(e[i]);
            var message_string = message.join("\n");
            //equals(message_string, '', 'debug');
            equals(message_string.indexOf('discarded'), -1, 'discarded');
            equals(message[0].indexOf('f1()@http://site.com:40 -- info f1') >= 0, true, 'f1');
            equals(message[1].indexOf('{anonymous}http://site.com:44 -- info f2') >= 0, true, 'f2 anonymous');
        }
    });

test("other", function() {
        var mode = printStackTrace.implementation.prototype.mode();
        var frame = function(args, fun, caller) {
            this.arguments = args;
            this.caller = caller;
            this.fun = fun;
        };
        frame.prototype.toString = function() { return JSON.stringify(this); }
        function f10() {};
        var frame_f2 = new frame({key: 'no array arg is stringified'}, 'nofunction', undefined);
        var frame_f1 = new frame([1, 'a"bc', f10], 'FUNCTION f1  (a,b,c)', frame_f2);
	expect(mode == 'other' ? 4 : 2);
	var message = printStackTrace.implementation.prototype.other(frame_f1);
	var message_string = message.join("\n");
	// equals(message_string, '', 'debug');
	equals(message[0].indexOf('f1([1,"a\\"bc","function"])') >= 0, true, 'f1');
	equals(message[1].indexOf('{anonymous}([])') >= 0, true, 'f2 anonymous');
        if(mode == 'other') {
            function f1(arg1, arg2) {
		var message = printStackTrace.implementation.prototype.other(arguments.callee);
		var message_string = message.join("\n");
		// equals(message_string, '', 'debug');
		equals(message[0].indexOf('f1([1,"a\\"bc","function"])') >= 0, true, 'f1');
		equals(message[1].indexOf('{anonymous}([])') >= 0, true, 'f2 anonymous');
            };
            var f2 = function() {
                f1(1, 'a"bc', f10);
            };
            f2();
        }
    });
