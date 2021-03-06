/**
 This test suite assumes that you are running it in the browser console while contenteditable-commands.html is loaded.
 */

(function(global) {

    var prohibited = ['red', 'blue', 'green'];

    if (!util.isSafari()) {
        console.clear();
    }

    if(typeof util === 'undefined') {
        throw new Error('missing util');
    }

    /**** runner ****/

    console.group('dom integration tests');
    console.time('total');

    testGetRangeWord();
    testIsRangeWithinHighlight();
    testIsRangeWordProhibited();
    testIsCaretAtNodeStartPlain();
    testIsCaretAtNodeStartStyle();
    testIsCaretAtNodeEndPlain();
    testIsCaretAtNodeEndStyle();
    testIsNodeLastChildWithoutStyles();
    testIsNodeLastChildWithStyles();
    testHighlightRange();
    testHighlightTwoRanges();
    testRemoveHighlight();
    testHighlightAllProhibitedWords();
    testSaveCaret();
    testRestoreCaret();
    testGetAbsoluteRange();
    testGetRelativeOffsetFromAbsoluteOffset();
    testSaveAbsoluteRange();
    testRestoreAbsoluteRange();

    console.timeEnd('total');
    console.groupEnd();

    console.group('unit tests');
    console.time('total');

    testFindWordBreakLeft();
    testFindWordBreakRight();
    testFindWordBreakLeftBeginning();
    testFindWordBreakRightEnd();
    testFindWordBreakSpaceLeft();
    testFindWordBreakSpaceRight();

    console.timeEnd('total');
    console.groupEnd();

    window.getSelection().removeAllRanges();

    return 'tests complete';

    /**** tests ****/

    function testRestoreAbsoluteRange() {
        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        util.restoreAbsoluteRange(global.containerEl);

        var selectedRange = util.getSelectedRange();

        expect(global.containerEl.childNodes.length === 3, 3);

        if (!selectedRange) {
            expect(false, null, 'no selected range found');
            return;
        }

        expect(selectedRange.startOffset === 2, 2);
        expect(selectedRange.endOffset === 4, 4);
    }

    function testSaveAbsoluteRange() {
        var expected = {
            startOffset: 2,
            endOffset: 15
        };

        global.containerEl.textContent = 'thar be red in here';

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        util.setRange(containerEl.firstChild, 2, containerEl.childNodes[2], 4);

        util.saveAbsoluteRange(global.containerEl);

        var actual = util.lastAbsoluteRange;

        expect(JSON.stringify(actual) === JSON.stringify(expected), expected, 'objects do not match')
    }

    function testGetRelativeOffsetFromAbsoluteOffset() {
        var expectedNode = util.getFirstNodeText(global.containerEl.childNodes[1], true);
        var expectedOffset = 1;

        global.containerEl.textContent = 'thar be red in here';

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        var actual = util.getRelativeOffsetFromAbsoluteOffset(global.containerEl, 9);

        expect(actual.node.isEqualNode(expectedNode), null, 'nodes do not match');
        expect(actual.offset === expectedOffset, expectedOffset);
    }


    function testGetAbsoluteRange() {
        var expected = {
            startOffset: 2,
            endOffset: 15
        };

        global.containerEl.textContent = 'thar be red in here';

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        util.setRange(containerEl.firstChild, 2, containerEl.childNodes[2], 4);

        var actual = util.getAbsoluteRange(containerEl);

        expect(JSON.stringify(actual) === JSON.stringify(expected), null, 'objects do not match');
    }

    function testRestoreCaret() {
        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        util.restoreCaret(global.containerEl);

        var position = util.getCaretPosition();

        expect(global.containerEl.childNodes.length === 3, 3);

        expect(position === 1, 1);
    }

    function testSaveCaret() {
        var expected = 12;

        global.containerEl.textContent = 'thar be red in here';

        util.setCaretPosition(global.containerEl.firstChild, 12);

        util.saveCaret(global.containerEl);

        var actual = util.lastCaretPosition;

        expect(actual === expected, expected);
    }

    function testHighlightAllProhibitedWords() {
        var expected = 8;

        global.containerEl.textContent = 'thar be red and blue and green and more red';

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        var actual = global.containerEl.childNodes.length;

        expect(actual === expected, expected);
    }

    function testRemoveHighlight() {
        var expected = 1;

        global.containerEl.textContent = 'thar be red in here';

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        var childNode = global.containerEl.childNodes[1];

        util.removeHighlight(global.containerEl, childNode);

        var actual = global.containerEl.childNodes.length;

        expect(actual === expected, expected);
    }

    function testHighlightTwoRanges() {
        var expected = 5;

        global.containerEl.textContent = 'thar be red and blue in here';

        var node = global.containerEl.firstChild;
        var startOffset = 8;
        var endOffset = 11;

        util.highlightRange(node, startOffset, endOffset);

        startOffset = 5;
        endOffset = 9;

        node = global.containerEl.childNodes[2];
        util.highlightRange(node, startOffset, endOffset);

        var actual = global.containerEl.childNodes.length;

        expect(actual === expected, expected);
    }

    function testHighlightRange() {
        var expected = 3;

        util.removeAllMarkup(global.containerEl);

        var node = global.containerEl.firstChild;

        if (global.containerEl.textContent.length < 11) {
            expected = 1;
        } else {
            var startOffset = 8;
            var endOffset = 11;

            util.highlightRange(global.containerEl.firstChild, startOffset, endOffset);
        }

        var actual = global.containerEl.childNodes.length;

        expect(actual === expected, expected);
    }

    function testIsNodeLastChildWithStyles() {
        var expected = false;
        var childNode;

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        // in case the text is manually removed
        if (global.containerEl.childNodes.length === 1) {
            expected = true;
        }

        childNode = global.containerEl.firstChild;

        var actual = util.isNodeLastChild(childNode);

        expect(actual === expected, expected);
    }

    function testIsNodeLastChildWithoutStyles() {
        var expected = true;

        util.removeAllMarkup(global.containerEl);

        var childNode = global.containerEl.firstChild;

        var actual = util.isNodeLastChild(childNode);

        expect(actual === expected, expected);
    }

    function testIsCaretAtNodeEndStyle() {
        var expected = true;
        var childNode;

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        if (global.containerEl.childNodes.length > 1) {
            childNode = global.containerEl.childNodes[1];
        } else {
            childNode = global.containerEl.firstChild;
        }

        util.setCaretPosition(childNode, childNode.textContent.length);

        var actual = util.isCaretAtNodeEnd();

        expect(actual === expected, expected);
    }

    function testIsCaretAtNodeEndPlain() {
        var expected = true;

        util.removeAllMarkup(global.containerEl);

        var childNode = global.containerEl.firstChild;

        util.setCaretPosition(childNode, childNode.textContent.length);

        var actual = util.isCaretAtNodeEnd();

        expect(actual === expected, expected);
    }

    function testIsCaretAtNodeStartStyle() {
        var expected = true;
        var childNode;
        var startOffset = util.isSafari() ? 1 : 0;

        util.highlightAllProhibitedWords(global.containerEl, prohibited);

        if (global.containerEl.childNodes.length > 1) {
            childNode = global.containerEl.childNodes[1];
        } else {
            childNode = global.containerEl.firstChild;
        }

        util.setCaretPosition(childNode, startOffset);

        var actual = util.isCaretAtNodeStart();

        expect(actual === expected, expected);
    }

    function testIsCaretAtNodeStartPlain() {
        var expected = true;

        util.removeAllMarkup(global.containerEl);

        var childNode = global.containerEl.firstChild;

        util.setCaretPosition(childNode, 0);

        var actual = util.isCaretAtNodeStart();

        expect(actual === expected, expected);
    }

    function testIsRangeWithinHighlight() {
        var expected = true;
        var childNode;

        if (global.containerEl.textContent.length === 0) {
            expected = false;
        } else {
            util.highlightAllProhibitedWords(global.containerEl, prohibited);

            if (global.containerEl.childNodes.length > 1) {
                childNode = global.containerEl.childNodes[1];
            } else {
                childNode = global.containerEl.firstChild;
            }

            if (childNode.textContent.length > 0) {
                util.setCaretPosition(childNode, 1);
            } else {
                expected = false;
            }
        }

        var actual = util.isRangeWithinHighlight();

        expect(actual === expected, expected);
    }

    function testIsRangeWordProhibited() {
        var expected = true;
        var childNode;

        util.removeAllMarkup(global.containerEl);

        childNode = global.containerEl.firstChild;

        if (childNode.textContent.length > 0 && childNode.textContent.indexOf('red') === 8) {
            util.setCaretPosition(childNode, 8);
        } else {
            expected = false;
        }

        var actual = util.isRangeWordProhibited(prohibited);

        expect(actual === expected, expected);
    }

    function testGetRangeWord() {
        var expected = {
            text: 'thar',
            startOffset: 0,
            endOffset: 4
        };

        util.setCaretPosition(global.containerEl.firstChild, 0);

        var actual = util.getRangeWord();

        expect(JSON.stringify(actual) === JSON.stringify(expected), expected, 'actual and expected objects do not match');
    }

    function testGetRangeWordRange() {
        var expected = 'red';
        var actual = util.getRangeWord();

        expect(actual === expected, 'actual result is not "red"');
    }

    function testFindWordBreakSpaceRight() {
        var expected = 4;
        var actual = util.findWordBreak('thar be red in here', 4, 'r');

        expect(actual === expected, expected);
    }

    function testFindWordBreakSpaceLeft() {
        var expected = 0;
        var actual = util.findWordBreak('thar be red in here', 4, 'l');

        expect(actual === expected, expected);
    }

    function testFindWordBreakLeft() {
        var expected = 8;
        var actual = util.findWordBreak('thar be red in here', 9, 'l');

        expect(actual === expected, expected);
    }

    function testFindWordBreakRight() {
        var expected = 11;
        var actual = util.findWordBreak('thar be red in here', 9, 'r');

        expect(actual === expected, expected);
    }

    function testFindWordBreakRightEnd() {
        var expected = 19;
        var actual = util.findWordBreak('thar be red in here', 18, 'r');

        expect(actual === expected, expected);
    }

    function testFindWordBreakLeftBeginning() {
        var expected = 0;
        var actual = util.findWordBreak('thar be red in here', 0, 'l');

        expect(actual === expected, expected);
    }

    // test supporters

    function expect(assertion, expected, message) {
        var caller = 'test';
        if (typeof expect.caller !== 'undefined' && typeof expect.caller.name !== 'undefined') {
            caller = expect.caller.name;
        }
        message = message || 'actual result is not ' + expected;
        if (!assertion) {
            console.error(caller + ' ' + message);
            return;
        }
        console.info(caller + ' passed');
    }

})(window);