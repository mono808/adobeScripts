//@require 'require.jsx'

var ioFile = require('ioFile');

var content = '[1,2,3,"lalala"]';

var outFile = new File('~/documents/test1/testfile.txt');

ioFile.write_file(outFile, content);