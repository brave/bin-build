import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import del from 'del';
import nock from 'nock';
import pathExists from 'path-exists';
import tempfile from 'tempfile';
import test from 'ava';
import m from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.beforeEach(t => {
	t.context.tmp = tempfile();
});

test.afterEach(async t => {
	await del(t.context.tmp, {force: true});
});

test('download and build source', async t => {
	nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.reply(200, () =>
			fs.readFile(path.join(__dirname, 'fixtures', 'test.tar.gz')),
		);

	await m.url('http://foo.com/gifsicle.tar.gz', [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${t.context.tmp}" --bindir="${t.context.tmp}"`,
		'make install',
	]);

	t.true(await pathExists(path.join(t.context.tmp, 'gifsicle')));
});

test('build source from existing archive', async t => {
	await m.file(path.join(__dirname, 'fixtures', 'test.tar.gz'), [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${t.context.tmp}" --bindir="${t.context.tmp}"`,
		'make install',
	]);

	t.true(await pathExists(path.join(t.context.tmp, 'gifsicle')));
});

test('accepts a string', async t => {
	await t.throwsAsync(() => m.directory([]), {instanceOf: TypeError, message: 'Expected a `string`, got `object`'});
	await t.throwsAsync(() => m.file([]), {instanceOf: TypeError, message: 'Expected a `string`, got `object`'});
	await t.throwsAsync(() => m.url([]), {instanceOf: TypeError, message: 'Expected a `string`, got `object`'});
});
